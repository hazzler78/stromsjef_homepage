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
  /** Fired when Salesys posts a resize with real form height (cross-origin usable signal). */
  onFormUsable?: () => void;
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

const MIN_USABLE_FORM_HEIGHT = 120;

/**
 * Embeds Salesys via web_form1.js (iframe inside mount div). Matches fastpris-avtal / elchef pattern:
 * script from https://salesys.se/scripts/web_form1.js, createWebForm(container, formId, { width: '100%' }).
 * Mount node is React-empty so Salesys can own its DOM (no reconcile wipes).
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

    const signalUsable = () => {
      if (cancelled || usableSignaledRef.current) return;
      usableSignaledRef.current = true;
      notifyState("ready");
      onFormUsableRef.current?.();
    };

    const tryInit = (): boolean => {
      if (cancelled || initializedRef.current) return true;
      if (typeof window.createWebForm !== "function") return false;
      try {
        container.innerHTML = "";
        const mergedOptions = {
          ...optionsRef.current,
          width: optionsRef.current?.width ?? "100%",
          onMessage: (event: MessageEvent) => {
            const data = event.data as { type?: string; height?: number } | null;
            if (data?.type === "resize" && typeof data.height === "number" && data.height >= MIN_USABLE_FORM_HEIGHT) {
              signalUsable();
            }
          },
        };
        const formInstance = window.createWebForm(container, formId, mergedOptions);
        window.myForm = formInstance;

        const fields = defaultFieldsRef.current;
        if (fields?.length && typeof formInstance?.setFields === "function") {
          formInstance.setFields(fields);
        }

        if (typeof onReadyRef.current === "function") {
          onReadyRef.current(formInstance);
        }

        initializedRef.current = true;
        return true;
      } catch (err) {
        console.warn("Salesys form init failed", err);
        return false;
      }
    };

    loadSalesysWebFormScript()
      .then(() => {
        if (cancelled) return;
        if (tryInit()) return;

        let attempts = 0;
        pollTimer = setInterval(() => {
          attempts += 1;
          if (tryInit() || attempts >= 40) {
            if (pollTimer) clearInterval(pollTimer);
            if (!initializedRef.current && !cancelled) {
              notifyState("failed");
            }
          }
        }, 250);
      })
      .catch(() => {
        if (!cancelled) notifyState("failed");
      });

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [formId]);

  return (
    <div className={wrapperClassName}>
      {/* Salesys owns this node — no React children inside */}
      <div id={containerId} ref={mountRef} />
    </div>
  );
}