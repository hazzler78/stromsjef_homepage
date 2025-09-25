"use client";

import { useEffect, useRef, useState } from "react";

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

type SalesysFormProps = {
  containerId?: string;
  formId: string;
  options?: SalesysFormOptions;
  defaultFields?: Array<{ fieldId: string; value: string }>; 
  wrapperClassName?: string;
  onReady?: (formInstance: SalesysFormInstance) => void;
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
}: SalesysFormProps) {
  const initializedRef = useRef(false);
  const [initFailed, setInitFailed] = useState(false);

  useEffect(() => {
    if (initializedRef.current) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    // Helper to attempt initializing when script and function are ready
    const tryInit = () => {
      if (initializedRef.current) return true;
      if (typeof window.createWebForm !== "function") return false;
      try {
        container.innerHTML = "";
        const formInstance = window.createWebForm(container, formId, options);
        window.myForm = formInstance;

        if (defaultFields && typeof formInstance?.setFields === "function") {
          formInstance.setFields(defaultFields);
        }

        if (typeof onReady === "function") {
          onReady(formInstance);
        }

        initializedRef.current = true;
        setInitFailed(false);
        console.log("Salesys form initialized", formInstance);
        return true;
      } catch (err) {
        console.warn("Salesys form init failed, will retry", err);
        return false;
      }
    };

    // If the script is already on the page, try immediately
    if (tryInit()) return;

    // Otherwise, inject the script and try on load, with polling fallback
    const webFormScript = document.createElement("script");
    webFormScript.src = "https://salesys.se/scripts/web_form1.js";
    webFormScript.async = true;
    webFormScript.onerror = () => {
      console.error("Failed to load Salesys web form script");
      setInitFailed(true);
    };
    document.body.appendChild(webFormScript);

    const onLoad = () => {
      // First attempt on load
      if (tryInit()) return;
      // Poll for up to ~10s if createWebForm is late-binding inside the script
      let attempts = 0;
      const maxAttempts = 40; // 40 * 250ms = 10s
      const poll = setInterval(() => {
        attempts += 1;
        if (tryInit() || attempts >= maxAttempts) {
          clearInterval(poll);
          if (!initializedRef.current) {
            console.error("Salesys form failed to initialize after waiting");
            setInitFailed(true);
          }
        }
      }, 250);
    };

    webFormScript.addEventListener("load", onLoad);
    return () => {
      webFormScript.removeEventListener("load", onLoad);
    };
  }, [containerId, formId, options, defaultFields, onReady]);

  return (
    <div id={containerId} className={wrapperClassName}>
      {initFailed && (
        <div style={{
          padding: "12px",
          background: "#fff4f4",
          border: "1px solid #fecaca",
          color: "#b91c1c",
          borderRadius: 8,
          fontSize: 14
        }}>
          Kunde inte ladda formuläret just nu. Kontrollera nätverket och att formId är giltigt.
        </div>
      )}
    </div>
  );
}


