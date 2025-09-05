import { downloadAudioFile, transcribeAudio, translateText } from "./utils/voiceTranslate.js";

const test = async () => {
  try {
    const url = "https://res.cloudinary.com/hamna123/video/upload/v1754230083/uvn0dzjunou0aeoxhhzo.webm";
    const filePath = await downloadAudioFile(url);

    const text = await transcribeAudio(filePath);
    console.log("📝 Transcribed:", text);

    const translated = await translateText(text, "fr"); // Translate to Urdu
    console.log("🌐 Translated:", translated);
  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
};

test();
