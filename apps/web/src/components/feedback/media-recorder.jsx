import { useEffect, useRef } from "react";
import { Camera, CircleStop, Mic, RotateCcw } from "lucide-react";
import { useMediaRecorder } from "../../hooks/use-media-recorder";
import { Button } from "../ui/button.jsx";
import { CardDescription } from "../ui/card.jsx";

export function MediaRecorderPanel({ mode, onBlobReady }) {
  const recorder = useMediaRecorder();
  const liveVideoRef = useRef(null);

  useEffect(() => {
    if (!liveVideoRef.current || !recorder.liveStream || mode !== "video" || recorder.status !== "recording") {
      return;
    }

    liveVideoRef.current.srcObject = recorder.liveStream;
  }, [mode, recorder.liveStream, recorder.status]);

  useEffect(() => {
    if (!recorder.blob) {
      return;
    }

    const fallbackMimeType = mode === "video" ? "video/webm" : "audio/webm";
    onBlobReady(recorder.blob, recorder.blob.type || fallbackMimeType);
  }, [mode, onBlobReady, recorder.blob]);

  function handleStart() {
    recorder.start(mode);
  }

  const showVoiceAnimation = mode === "audio" && (recorder.status === "recording" || Boolean(recorder.previewUrl));

  return (
    <div className="space-y-4 rounded-[28px] border border-border/80 bg-white/70 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-muted p-3">
          {mode === "video" ? <Camera className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </div>
        <div>
          <p className="font-semibold">Record {mode}</p>
          <CardDescription>
            Capture a quick {mode} testimonial directly in the browser.
          </CardDescription>
        </div>
      </div>

      {mode === "video" && recorder.status === "recording" && recorder.liveStream && (
        <div className="space-y-2">
          <video ref={liveVideoRef} autoPlay muted playsInline className="w-full rounded-3xl" />
          <p className="text-xs font-medium text-emerald-700">Recording live video...</p>
        </div>
      )}

      {showVoiceAnimation && (
        <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex h-10 items-end justify-center gap-1.5">
            {[8, 18, 26, 14, 30, 20, 12, 24, 16].map((height, index) => (
              <span
                key={`${height}-${index}`}
                className="inline-block w-1.5 animate-pulse rounded-full bg-emerald-500"
                style={{ height: `${height}px`, animationDelay: `${index * 120}ms` }}
              />
            ))}
          </div>
          <p className="text-center text-xs font-medium text-emerald-700">
            {recorder.status === "recording" ? "Recording voice..." : "Voice preview ready"}
          </p>
        </div>
      )}

      {recorder.previewUrl &&
        (mode === "video" ? (
          <video src={recorder.previewUrl} controls className="w-full rounded-3xl" />
        ) : (
          <audio src={recorder.previewUrl} controls className="w-full" />
        ))}

      {recorder.error && <p className="text-sm text-rose-600">{recorder.error}</p>}

      <div className="flex flex-wrap gap-3">
        {recorder.status !== "recording" && (
          <Button type="button" onClick={handleStart} className="gap-2">
            {mode === "video" ? <Camera className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            Start recording
          </Button>
        )}

        {recorder.status === "recording" && (
          <Button type="button" variant="secondary" onClick={recorder.stop} className="gap-2">
            <CircleStop className="h-4 w-4" />
            Stop
          </Button>
        )}

        {recorder.blob && (
          <>
            <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Recording attached. You can submit now.
            </p>
            <Button type="button" variant="ghost" onClick={recorder.reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </>
        )}
      </div>
    </div>
  );
}