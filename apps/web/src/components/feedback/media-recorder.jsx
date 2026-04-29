import { Camera, CircleStop, Mic, RotateCcw } from "lucide-react";
import { useMediaRecorder } from "../../hooks/use-media-recorder";
import { Button } from "../ui/button.jsx";
import { CardDescription } from "../ui/card.jsx";

export function MediaRecorderPanel({ mode, onBlobReady }) {
  const recorder = useMediaRecorder();

  function handleStart() {
    recorder.start(mode);
  }

  function handleUseRecording() {
    onBlobReady(recorder.blob, mode === "video" ? "video/webm" : "audio/webm");
  }

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
            <Button type="button" variant="secondary" onClick={handleUseRecording}>
              Use recording
            </Button>
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