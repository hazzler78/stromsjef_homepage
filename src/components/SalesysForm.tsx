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
  onFormUsable?: () => void;
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

const DEFAULT_MIN_IFRAME_HEIGHT_PX = 720;
const SKAFFA_ORIGIN = "https://skaffa.salesys.se";

function buildFormUrl(formId: string, options?: SalesysFormOptions): URL {
  const url = new URL(formId, SKAFFA_ORIGIN);
  if (options?.loadBackground) url.searchParams.set("loadBackground", options.loadBackground);
  if (options?.lang) url.searchParams.set("lang", options.lang);
  if (options?.test) url.searchParams.set("test", "1");
  url.searchParams.set("t", String(Date.now()));
  try {
    const referrer = new URL(document.location.href);
    url.searchParams.set("referrer", referrer.origin + referrer.pathname + referrer.search);
  } catch {
    /* ignore */
  }
  return url;
}

/**
 * Embeds Salesys as a full-size iframe (same URL as web_form1.js createWebForm).
 * Forces min-height so the form is fillable before resize messages arrive.
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
    usableSignaledRef.current = false;
    notifyState("loading");

    const container = mountRef.current;
    if (!container) {
      notifyState("failed");
      return;
    }

    let cancelled = false;
    let iframeEl: HTMLIFrameElement | null = null;
    let messageQueue: Array<Record<string, unknown>> = [];
    let iframeReady = false;

    const floorHeight = () => Math.max(minHeightPx, Math.round(window.innerHeight * 0.7));

    const signalUsable = () => {
      if (cancelled || usableSignaledRef.current) return;
      usableSignaledRef.current = true;
      notifyState("ready");
      onFormUsableRef.current?.();
    };

    const applySize = (iframe: HTMLIFrameElement, reportedHeight?: number) => {
      const floor = floorHeight();
      iframe.style.width = "100%";
      iframe.style.maxWidth = "100%";
      iframe.style.border = "0";
      iframe.style.display = "block";
      iframe.style.minHeight = `${floor}px`;
      const next =
        typeof reportedHeight === "number" && reportedHeight > 0
          ? Math.max(reportedHeight + 24, floor)
          : floor;
      iframe.style.height = `${next}px`;
    };

    const postToIframe = (message: Record<string, unknown>) => {
      if (iframeReady && iframeEl?.contentWindow) {
        iframeEl.contentWindow.postMessage(message, "*");
      } else {
        messageQueue.push(message);
      }
    };

    const formInstance: SalesysFormInstance = {
      setFields: (fields) => {
        postToIframe({ type: "setFields", references: fields });
      },
    };

    const onMessage = (event: MessageEvent) => {
      if (cancelled) return;
      if (event.origin !== SKAFFA_ORIGIN) return;
      if (!iframeEl || event.source !== iframeEl.contentWindow) return;
      const data = event.data as { type?: string; height?: number; url?: string; context?: string } | null;
      if (!data?.type) return;
      if (data.type === "resize" && typeof data.height === "number") {
        applySize(iframeEl, data.height);
        signalUsable();
      }
    };

    const mountIframe = () => {
      if (cancelled || !container) return;
      // Wait for accordion layout so width is non-zero
      if (container.clientWidth < 40) {
        requestAnimationFrame(mountIframe);
        return;
      }

      container.innerHTML = "";
      const url = buildFormUrl(formId, {
        ...optionsRef.current,
        loadBackground: optionsRef.current?.loadBackground ?? "#f8fafc",
      });

      const iframe = document.createElement("iframe");
      iframe.title = "Bytteskjema";
      iframe.setAttribute("allow", "payment *; clipboard-write");
      applySize(iframe);
      iframe.src = url.href;
      iframeEl = iframe;

      iframe.addEventListener("load", () => {
        iframeReady = true;
        for (const message of messageQueue) {
          iframe.contentWindow?.postMessage(message, "*");
        }
        messageQueue = [];
        applySize(iframe);
        signalUsable();

        const fields = defaultFieldsRef.current;
        if (fields?.length) {
          postToIframe({ type: "setFields", references: fields });
        }
      });

      window.addEventListener("message", onMessage);
      container.appendChild(iframe);
      window.myForm = formInstance;
      onReadyRef.current?.(formInstance);
      // Tall shell is visible immediately; mark usable on load/resize
    };

    // Prefer direct iframe (same as createWebForm output) — avoids script-load failures on mobile.
    // Still warm the Salesys script in background for pages that call createWebForm elsewhere.
    void loadSalesysWebFormScript().catch(() => {});
    const startTimer = window.setTimeout(mountIframe, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.removeEventListener("message", onMessage);
      if (iframeEl) {
        iframeEl.remove();
        iframeEl = null;
      }
      container.innerHTML = "";
    };
  }, [formId, minHeightPx]);

  return (
    <div className={wrapperClassName} style={{ width: "100%", minHeight: minHeightPx }}>
      <div
        id={containerId}
        ref={mountRef}
        style={{ width: "100%", minHeight: minHeightPx, minWidth: "100%" }}
      />
    </div>
  );
}