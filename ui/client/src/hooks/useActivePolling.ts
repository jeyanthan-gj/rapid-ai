import { useEffect } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";

const ACTIVE_POLL_INTERVAL_MS = 2000;

/**
 * Refreshes the currently mounted page while the browser tab is visible.
 * It deliberately polls data instead of reloading the document, so filters,
 * forms, and scroll position stay intact during a live HR demo.
 */
export function useActivePolling(
  refresh: () => void | Promise<void>,
  enabled = true,
  intervalMs = ACTIVE_POLL_INTERVAL_MS,
) {
  const stableRefresh = usePersistFn(refresh);

  useEffect(() => {
    if (!enabled) return;

    let timer: number | undefined;
    let running = false;

    const refreshIfVisible = () => {
      if (document.visibilityState !== "visible" || running) return;
      running = true;
      Promise.resolve()
        .then(stableRefresh)
        .catch(() => undefined)
        .finally(() => {
          running = false;
        });
    };

    const start = () => {
      if (timer !== undefined) window.clearInterval(timer);
      if (document.visibilityState === "visible") {
        timer = window.setInterval(refreshIfVisible, intervalMs);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshIfVisible();
        start();
      } else if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    start();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [enabled, intervalMs, stableRefresh]);
}
