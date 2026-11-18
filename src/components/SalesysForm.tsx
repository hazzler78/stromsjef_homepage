"use client";

import { useEffect, useRef } from "react";
import { loadSalesysWebFormScript } from "@/lib/loadSalesysWebFormScript";

export type SalesysFormField = {
  name?: string;
  label?: string;
  value?: string;
};

export type SalesysFormInstance = {
  setFields?: (fields: Array<{ fieldId: string; value: string }>) => void;
  getFields?: () => SalesysFormField[];
};

type SalesysFormOptions = {
  width?: string;
  test?: boolean;
  lang?: string;
  loadBackground?: string;
};

export type SalesysLoadState = "loading" | "ready" | "failed";

type SalesysFormProps = {
  containerId?: string;
  formId: string;
  options?: SalesysFormOptions;
  defaultFields?: Array<{ fieldId: string; value: string }>;
  wrapperClassName?: string;
  onReady?: (formInstance: SalesysFormInstance) => void;
  onLoadStateChange?: (state: SalesysLoadState) => void;
  /** Fired when the iframe is mounted at a fillable size (or Salesys reports a real height). */
  onFormUsable?: () => void;
  /** Minimum iframe height in px so the form is fillable before Salesys resize posts. */
  minHeightPx?: number;
};

declare global {
  interface Window {
    createWebForm?: (
      containerEl: HTMLElement,
      formId: string,
      opts?: SalesysFormOptions & { onMessage?: (event: MessageEvent) => void }
    ) => SalesysFormInstance;
    myForm?: SalesysFormInstance;
  }
}

/** Salesys iframe has no default height until a resize postMessage — use a real form-sized floor. */
const DEFAULT_MIN_IFRAME_HEIGHT_PX = 720;

/**
 * Embeds Salesys via web_form1.js → iframe to skaffa.salesys.se/{formId}.
 * Mount node is React-empty so Salesys owns the DOM.
 */
export default function SalesysForm({
  containerId = "form-container",
  formId,
  options,
  defaultFields,
  wrapperClassName,
  onReady,
  onLoadStateChange,
  onFormUsable,
  minHeightPx = DEFAULT_MIN_IFRAME_HEIGHT_PX,
}: SalesysFormProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const onLoadStateRef = useRef(onLoadStateChange);
  const onFormUsableRef = useRef(onFormUsable);
  const defaultFieldsRef = useRef(defaultFields);
  const optionsRef = useRef(options);
  const usableSignaledRef = useRef(false);

  onReadyRef.current = onReady;
  onLoadStateRef.current = onLoadStateChange;
  onFormUsableRef.current = onFormUsable;
  defaultFieldsRef.current = defaultFields;
  optionsRef.current = options;

  const notifyState = (next: SalesysLoadState) => {
    onLoadStateRef.current?.(next);
  };

  useEffect(() => {
    initializedRef.current = false;
    usableSignaledRef.current = false;
    notifyState("loading");

    const container = mountRef.current;
    if (!container) {
      notifyState("failed");
      return;
    }

    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let iframeWatch: MutationObserver | undefined;

    const signalUsable = () => {
      if (cancelled || usableSignaledRef.current) return;
      usableSignaledRef.current = true;
      notifyState("ready");
      onFormUsableRef.current?.();
    };

    const applyIframeSize = (iframe: HTMLIFrameElement, reportedHeight?: number) => {
      iframe.style.width = "100%";
      iframe.style.maxWidth = "100%";
      iframe.style.border = "0";
      iframe.style.display = "block";
      iframe.setAttribute("scrolling", "no");
      const floor = Math.max(minHeightPx, Math.round(window.innerHeight * 0.7));
      const next =
        typeof reportedHeight === "number" && reportedHeight > 0
          ? Math.max(reportedHeight + 24, floor)
          : floor;
      iframe.style.minHeight = `${floor}px`;
      iframe.style.height = `${next}px`;
    };

    const watchForIframe = () => {
      const existing = container.querySelector("iframe") as HTMLIFrameElement | null;
      if (existing) {
        applyIframeSize(existing);
        signalUsable();
        return;
      }
      iframeWatch = new MutationObserver(() => {
        const iframe = container.querySelector("iframe") as HTMLIFrameElement | null;
        if (iframe) {
          applyIframeSize(iframe);
          signalUsable();
          iframeWatch?.disconnect();
          iframeWatch = undefined;
        }
      });
      iframeWatch.observe(container, { childList: true, subtree: true });
    };

    const tryInit = (): boolean => {
      if (cancelled || initializedRef.current) return true;
      if (typeof window.createWebForm !== "function") return false;
      // Accordion mount can have 0 width for one frame — wait for layout
      if (container.clientWidth < 40) return false;

      try {
        container.innerHTML = "";
        const mergedOptions = {
          ...optionsRef.current,
          width: "100%",
          loadBackground: optionsRef.current?.loadBackground ?? "#f8fafc",
          onMessage: (event: MessageEvent) => {
            const data = event.data as { type?: string; height?: number } | null;
            if (data?.type !== "resize") return;
            const iframe = container.querySelector("iframe") as HTMLIFrameElement | null;
            if (iframe) {
              applyIframeSize(iframe, typeof data.height === "number" ? data.height : undefined);
              signalUsable();
            }
          },
        };
        const formInstance = window.createWebForm(container, formId, mergedOptions);
        window.myForm = formInstance;

        const fields = defaultFieldsRef.current;
        if (fields?.length && typeof formInstance?.setFields === "function") {
          // Defer so iframe exists (createWebForm appends after 1ms)
          window.setTimeout(() => {
            if (cancelled) return;
            try {
              formInstance.setFields?.(fields);
            } catch {
              /* ignore */
            }
          }, 50);
        }

        if (typeof onReadyRef.current === "function") {
          onReadyRef.current(formInstance);
        }

        initializedRef.current = true;
        watchForIframe();
        // createWebForm appends iframe after 1ms timeout
        window.setTimeout(() => {
          if (cancelled) return;
          const iframe = container.querySelector("iframe") as HTMLIFrameElement | null;
          if (iframe) {
            applyIframeSize(iframe);
            signalUsable();
          }
        }, 30);
        return true;
      } catch (err) {
        console.warn("Salesys form init failed", err);
        return false;
      }
    };

    const start = () => {
      loadSalesysWebFormScript()
        .then(() => {
          if (cancelled) return;
          if (tryInit()) return;

          let attempts = 0;
          pollTimer = setInterval(() => {
            attempts += 1;
            if (tryInit() || attempts >= 60) {
              if (pollTimer) clearInterval(pollTimer);
              if (!initializedRef.current && !cancelled) {
                notifyState("failed");
              }
            }
          }, 100);
        })
        .catch(() => {
          if (!cancelled) notifyState("failed");
        });
    };

    // Wait one frame so accordion panel has laid out width
    const widthWaitTimer = setTimeout(start, 0);

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      clearTimeout(widthWaitTimer);
      iframeWatch?.disconnect();
    };
  }, [formId, minHeightPx]);

  return (
    <div
      className={wrapperClassName}
      style={{ width: "100%", minHeight: minHeightPx }}
    >
      <div
        id={containerId}
        ref={mountRef}
        style={{
          width: "100%",
          minHeight: minHeightPx,
          minWidth: "100%",
        }}
      />
    </div>
  );
}