import axios from "axios";

const GEMINI_KEY = process.env.GEMINI_KEY;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function askGemini(history, message) {

  const contents = [
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

  const res = await axios.post(
    `${GEMINI_URL}?key=${GEMINI_KEY}`,
    {
      contents
    }
  );

  return res.data.candidates[0].content.parts[0].text;

}