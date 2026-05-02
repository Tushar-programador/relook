import { useEffect, useRef, useState } from "react";

export function useMediaRecorder() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const autoStopTimerRef = useRef(null);
  const elapsedIntervalRef = useRef(null);
  const [liveStream, setLiveStream] = useState(null);
  const [status, setStatus] = useState("idle");
  const [blob, setBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [maxSeconds, setMaxSeconds] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      clearTimeout(autoStopTimerRef.current);
      clearInterval(elapsedIntervalRef.current);
      setLiveStream(null);
    };
  }, [previewUrl]);

  async function start(kind, options = {}) {
    try {
      setError("");
      setBlob(null);
      setElapsed(0);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: kind === "video"
      });

      streamRef.current = stream;
      setLiveStream(stream);
      chunksRef.current = [];

      const limit = options.maxSeconds ?? null;
      setMaxSeconds(limit);

      // Build MediaRecorder options with compression bitrates
      const recorderOptions = {};
      if (kind === "video" && options.videoBitsPerSecond) {
        recorderOptions.videoBitsPerSecond = options.videoBitsPerSecond;
      }
      if (options.audioBitsPerSecond) {
        recorderOptions.audioBitsPerSecond = options.audioBitsPerSecond;
      }

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        clearTimeout(autoStopTimerRef.current);
        clearInterval(elapsedIntervalRef.current);

        const recordedBlob = new Blob(chunksRef.current, {
          type: kind === "video" ? "video/webm" : "audio/webm"
        });

        setBlob(recordedBlob);
        setPreviewUrl(URL.createObjectURL(recordedBlob));
        setStatus("recorded");

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setLiveStream(null);
      };

      mediaRecorder.start();
      setStatus("recording");

      // Elapsed counter
      elapsedIntervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      // Auto-stop at limit
      if (limit) {
        autoStopTimerRef.current = setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
        }, limit * 1000);
      }
    } catch (err) {
      setError(err.message || "Unable to start recording");
      setLiveStream(null);
      setStatus("idle");
    }
  }

  function stop() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  function reset() {
    clearTimeout(autoStopTimerRef.current);
    clearInterval(elapsedIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setLiveStream(null);
    setPreviewUrl("");
    setBlob(null);
    setError("");
    setStatus("idle");
    setElapsed(0);
    setMaxSeconds(null);
  }

  return {
    status,
    liveStream,
    blob,
    previewUrl,
    error,
    elapsed,
    maxSeconds,
    start,
    stop,
    reset
  };
}
