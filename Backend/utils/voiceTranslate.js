import fs from "fs";
import fetch from "node-fetch";
import { translate } from "@vitalets/google-translate-api";
import path from "path";
import { pipeline, env } from "@xenova/transformers";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

//  Suppress ONNX Runtime Warnings
env.logLevel = "error";

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Suppress ONNX Runtime logs


let transcriber;

// Load Whisper model
const loadModel = async () => {
   const originalWarn = console.warn;
    console.warn = () => {};
  if (!transcriber) {
    console.log("Loading Whisper model...");
    transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en", { device: "cpu" });
    console.log("Whisper model loaded ");
   
  }
    console.warn = originalWarn;
  return transcriber;
};

// Download audio file
export const downloadAudioFile = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download audio file: ${res.statusText}`);

  const buffer = await res.arrayBuffer();
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const tempPath = path.join(tempDir, `voice-${Date.now()}.webm`);
  fs.writeFileSync(tempPath, Buffer.from(buffer));
  return tempPath;
};

// Decode audio to Float32Array using ffmpeg
const decodeAudio = (filePath) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const command = ffmpeg(filePath)
      .format("f32le") // raw float32 PCM
      .audioChannels(1)
      .audioFrequency(16000)
      .on("error", (err) => reject(err))
      .on("end", () => {
        const buffer = Buffer.concat(chunks);
        const floatArray = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
        resolve(floatArray);
      })
      .pipe();

    command.on("data", (chunk) => chunks.push(chunk));
  });
};

// Transcribe audio
export const transcribeAudio = async (filePath) => {
  try {
    const model = await loadModel();
    const audioData = await decodeAudio(filePath);
    const result = await model(audioData);
    console.log("Transcription result:", result);
    return result?.text || "";
  } catch (err) {
    console.error("Whisper transcription failed:", err.message);
    throw new Error("Failed to transcribe audio");
  }
};

// Translate text
export const translateText = async (text, lang) => {
  try {
    const res = await translate(text, { to: lang });
    console.log(`Translated text to ${lang}:`, res.text);
    console.log("Translation successful ", res.text);
    return res.text;
  } catch (err) {
    console.error("Translation failed:", err.message);
    return text;
  }
};
