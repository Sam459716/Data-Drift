// Speech-to-Text Service — wraps Web Speech API.
// Replace startListening with a cloud STT provider call without touching UI code.

export interface SpeechSession {
  stop: () => void;
  cancel: () => void;
}

export type SpeechStatus = "idle" | "listening" | "processing" | "done" | "error";

export interface SpeechOptions {
  lang?: string; // BCP-47 e.g. "hi-IN", "en-IN", "mr-IN"
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onStatusChange: (status: SpeechStatus) => void;
  onError?: (msg: string) => void;
}

const SUPPORTED = typeof window !== "undefined" &&
  !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" &&
    (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);
}

export function startListening(opts: SpeechOptions): SpeechSession {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) {
    opts.onStatusChange("error");
    opts.onError?.("Browser does not support speech recognition.");
    return { stop: () => {}, cancel: () => {} };
  }

  const r = new SR();
  r.continuous = false;
  r.interimResults = true;
  r.lang = opts.lang ?? "hi-IN";

  let cancelled = false;

  r.onstart = () => opts.onStatusChange("listening");

  r.onresult = (e: any) => {
    let interim = "";
    let final = "";
    for (const result of Array.from(e.results as SpeechRecognitionResultList)) {
      const r = result as SpeechRecognitionResult;
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (interim) opts.onInterim?.(interim);
    if (final) opts.onFinal(final);
  };

  r.onend = () => {
    if (!cancelled) opts.onStatusChange("done");
  };

  r.onerror = (e: any) => {
    if (e.error === "not-allowed") {
      opts.onStatusChange("error");
      opts.onError?.("Microphone access denied. Please allow microphone access in browser settings.");
    } else if (e.error === "no-speech") {
      opts.onStatusChange("idle");
    } else {
      opts.onStatusChange("error");
      opts.onError?.(e.error ?? "Unknown speech error");
    }
  };

  try {
    r.start();
  } catch {
    opts.onStatusChange("error");
    opts.onError?.("Could not start microphone.");
  }

  return {
    stop: () => {
      try { r.stop(); } catch {}
    },
    cancel: () => {
      cancelled = true;
      try { r.abort(); } catch {}
      opts.onStatusChange("idle");
    },
  };
}
