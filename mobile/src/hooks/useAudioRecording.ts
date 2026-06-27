import { useState, useCallback, useRef } from "react";
import { audioService } from "../services/audio";
import { api } from "../services/api";
import { logger } from "../utils/logger";

interface RecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
}

export function useAudioRecording() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isProcessing: false,
    error: null,
  });
  const pathRef = useRef<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setState({ isRecording: false, isProcessing: false, error: null });
      await audioService.startRecording();
      setState({ isRecording: true, isProcessing: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start recording";
      setState({ isRecording: false, isProcessing: false, error: message });
      logger.error("Recording start failed", { error: message });
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      const result = await audioService.stopRecording();
      pathRef.current = result.path;

      setState({ isRecording: false, isProcessing: true, error: null });

      if (api.isConfigured()) {
        const transcriptionResult = await api.uploadAudio("/api/transcribe", result.path);
        setState({ isRecording: false, isProcessing: false, error: null });
        return (transcriptionResult as any)?.text ?? null;
      }

      setState({ isRecording: false, isProcessing: false, error: null });
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to stop recording";
      setState({ isRecording: false, isProcessing: false, error: message });
      logger.error("Recording stop failed", { error: message });
      return null;
    }
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
  };
}
