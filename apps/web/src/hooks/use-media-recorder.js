import { useEffect, useRef, useState } from "react";

export function useMediaRecorder() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [blob, setBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [previewUrl]);

  async function start(kind) {
    try {
      setError("");
      setBlob(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: kind === "video"
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: kind === "video" ? "video/webm" : "audio/webm"
        });

        setBlob(recordedBlob);
        setPreviewUrl(URL.createObjectURL(recordedBlob));
        setStatus("recorded");

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setStatus("recording");
    } catch (err) {
      setError(err.message || "Unable to start recording");
      setStatus("idle");
    }
  }

  function stop() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  function reset() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setBlob(null);
    setError("");
    setStatus("idle");
  }

  return {
    status,
    blob,
    previewUrl,
    error,
    start,
    stop,
    reset
  };
}