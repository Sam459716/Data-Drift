// Voice Recorder Service — uses browser MediaRecorder API to record voice complaints.
// Cleanly handles permissions, recording states, audio playback, and error conditions.

export interface RecordedAudio {
  blob: Blob;
  url: string;
  durationSeconds: number;
  mimeType: string;
  sizeBytes: number;
}

export interface VoiceRecorderSession {
  stop: () => Promise<RecordedAudio>;
  cancel: () => void;
  getDuration: () => number;
}

export type VoiceRecorderError =
  | "permission_denied"
  | "not_supported"
  | "no_device"
  | "recording_failed";

export function isMediaRecorderSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

export async function startVoiceRecording(
  onTimeUpdate?: (seconds: number) => void
): Promise<{ session?: VoiceRecorderSession; error?: VoiceRecorderError; message?: string }> {
  if (!isMediaRecorderSupported()) {
    return {
      error: "not_supported",
      message: "Audio recording is not supported in this browser. Please use a modern browser.",
    };
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
  } catch (err: any) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      return {
        error: "permission_denied",
        message: "Microphone permission was denied. Please allow microphone access in your browser settings to record a complaint.",
      };
    }
    if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      return {
        error: "no_device",
        message: "No microphone device was detected on your system.",
      };
    }
    return {
      error: "recording_failed",
      message: err.message || "Failed to access microphone.",
    };
  }

  // Determine supported MIME type
  let mimeType = "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    mimeType = "audio/webm;codecs=opus";
  } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
    mimeType = "audio/mp4";
  } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
    mimeType = "audio/ogg;codecs=opus";
  }

  const chunks: BlobPart[] = [];
  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  const startTime = Date.now();
  let timerId: any = null;

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  mediaRecorder.start(250); // collect 250ms chunks

  if (onTimeUpdate) {
    timerId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      onTimeUpdate(elapsed);
    }, 500);
  }

  const stopTracks = () => {
    if (timerId) clearInterval(timerId);
    stream.getTracks().forEach((track) => track.stop());
  };

  const session: VoiceRecorderSession = {
    getDuration: () => Math.floor((Date.now() - startTime) / 1000),
    stop: (): Promise<RecordedAudio> => {
      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          stopTracks();
          const finalDuration = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
          const audioBlob = new Blob(chunks, { type: mimeType });
          const audioUrl = URL.createObjectURL(audioBlob);
          resolve({
            blob: audioBlob,
            url: audioUrl,
            durationSeconds: finalDuration,
            mimeType,
            sizeBytes: audioBlob.size,
          });
        };
        mediaRecorder.onerror = (e) => {
          stopTracks();
          reject(e);
        };
        try {
          mediaRecorder.stop();
        } catch (err) {
          stopTracks();
          reject(err);
        }
      });
    },
    cancel: () => {
      stopTracks();
      try {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      } catch {}
    },
  };

  return { session };
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
