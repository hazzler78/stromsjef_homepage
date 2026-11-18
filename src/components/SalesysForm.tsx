"use client";

import { useEffect, useRef, useState } from "react";
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
  onMessage?: (event: MessageEvent) => void;
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
  loadTimeoutMs?: number;
};

declare global {
  interface Window {
    createWebForm?: (
      containerEl: HTMLElement,
      formId: string,
      opts?: SalesysFormOptions
    ) => SalesysFormInstance;
    myForm?: SalesysFormInstance;
  }
}

const DEFAULT_LOAD_TIMEOUT_MS = 5000;

/**
 * Loads the Salesys web form script and initializes the form in a provided container.
 */
export default function SalesysForm({
  containerId = "form-container",
  formId,
  options,
  defaultFields,
  wrapperClassName,
  onReady,
  onLoadStateChange,
  loadTimeoutMs = DEFAULT_LOAD_TIMEOUT_MS,
}: SalesysFormProps) {
  const initializedRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const onLoadStateRef = useRef(onLoadStateChange);
  const defaultFieldsRef = useRef(defaultFields);
  const optionsRef = useRef(options);
  const [loadState, setLoadState] = useState<SalesysLoadState>("loading");

  onReadyRef.current = onReady;
  onLoadStateRef.current = onLoadStateChange;
  defaultFieldsRef.current = defaultFields;
  optionsRef.current = options;

  const setState = (next: SalesysLoadState) => {
    setLoadState(next);
    onLoadStateRef.current?.(next);
  };

  useEffect(() => {
    initializedRef.current = false;
    setState("loading");

    const container = document.getElementById(containerId);
    if (!container) {
      setState("failed");
      return;
    }

    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let loadTimeout: ReturnType<typeof setTimeout> | undefined;

    const clearWatchdog = () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        loadTimeout = undefined;
      }
    };

    const fail = (reason: string) => {
      if (cancelled || initializedRef.current) return;
      console.warn("Salesys form load failed:", reason);
      setState("failed");
      clearWatchdog();
    };

    const armWatchdog = () => {
      clearWatchdog();
      loadTimeout = setTimeout(() => {
        if (cancelled || initializedRef.current) return;
        if (!initializedRef.current) {
          fail("timeout waiting for Salesys form content");
        }
      }, loadTimeoutMs);
    };

    const markReady = (formInstance: SalesysFormInstance) => {
      if (cancelled || initializedRef.current) return;
      initializedRef.current = true;
      setState("ready");
      clearWatchdog();
      onReadyRef.current?.(formInstance);
    };

    const tryInit = (): boolean => {
      if (cancelled || initializedRef.current) return true;
      if (typeof window.createWebForm !== "function") return false;
      try {
        container.innerHTML = "";
        const formInstanceRef: { current: SalesysFormInstance | null } = { current: null };

        const mergedOptions: SalesysFormOptions = {
          ...optionsRef.current,
          onMessage: (event: MessageEvent) => {
            optionsRef.current?.onMessage?.(event);
            const data = event.data as { type?: string; height?: number } | null;
            if (
              data?.type === "resize" &&
              typeof data.height === "number" &&
              data.height > 60 &&
              formInstanceRef.current
            ) {
              markReady(formInstanceRef.current);
            }
          },
        };
        const formInstance = window.createWebForm(container, formId, mergedOptions);
        formInstanceRef.current = formInstance;
        window.myForm = formInstance;

        const fields = defaultFieldsRef.current;
        if (fields?.length && typeof formInstance?.setFields === "function") {
          formInstance.setFields(fields);
        }

        const iframe = container.querySelector("iframe");
        if (iframe) {
          armWatchdog();
        } else {
          markReady(formInstance);
        }

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
        const maxAttempts = Math.ceil(loadTimeoutMs / 250);
        pollTimer = setInterval(() => {
          attempts += 1;
          if (tryInit() || attempts >= maxAttempts) {
            if (pollTimer) clearInterval(pollTimer);
            pollTimer = undefined;
            if (!initializedRef.current && !cancelled) {
              fail("createWebForm never became available");
            }
          }
        }, 250);
      })
      .catch(() => {
        fail("script load error");
      });

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      clearWatchdog();
    };
  }, [containerId, formId, loadTimeoutMs]);

  return (
    <div id={containerId} className={wrapperClassName} data-salesys-state={loadState}>
      {loadState === "failed" && (
        <div
          style={{
            padding: "12px",
            background: "#fff4f4",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          Kunne ikke laste bytteskjemaet nå. Prøv igjen, eller fortsett via leverandørens bestillingsside nedenfor.
        </div>
      )}
    </div>
  );
}