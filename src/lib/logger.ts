export function addRinchanLog(title: string, description: string, type: "warning" | "success" = "success") {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("rinchan_log", {
      detail: { title, description, type, timestamp: Date.now() },
    });
    window.dispatchEvent(event);
  }
}
