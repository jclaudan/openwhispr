import { logger } from "../utils/logger";

let AudioRecorder: any;

try {
  AudioRecorder = require("react-native-audio-recorder-player");
} catch {
  logger.warn("react-native-audio-recorder-player not available");
}

interface RecordingResult {
  path: string;
  durationMs: number;
  size: number;
}

class AudioRecordingService {
  private recorder: any = null;
  private isRecording = false;

  async requestPermission(): Promise<boolean> {
    try {
      const { PermissionsAndroid } = require("react-native");
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return true; // iOS handles permissions via Info.plist
    }
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) return;
    if (!AudioRecorder) throw new Error("Audio recorder not available");

    const hasPermission = await this.requestPermission();
    if (!hasPermission) throw new Error("Microphone permission denied");

    this.recorder = new AudioRecorder();
    const result = await this.recorder.startRecorder();
    this.isRecording = true;
    logger.debug("Recording started", { path: result });
  }

  async stopRecording(): Promise<RecordingResult> {
    if (!this.isRecording || !this.recorder) {
      throw new Error("Not recording");
    }

    const result = await this.recorder.stopRecorder();
    this.isRecording = false;

    const fileInfo = await this.recorder?.getAudioInfo?.() ?? {};
    return {
      path: result,
      durationMs: fileInfo.duration ?? 0,
      size: fileInfo.size ?? 0,
    };
  }

  get isActive(): boolean {
    return this.isRecording;
  }
}

export const audioService = new AudioRecordingService();
