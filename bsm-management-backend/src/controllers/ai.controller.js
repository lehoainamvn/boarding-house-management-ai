import axios from "axios";

const GEMINI_URL =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function chatWithAI(req, res) {

  const { message } = req.body;

  try {

    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              { text: message }
            ]
          }
        ]
      }
    );

    const reply =
      response.data.candidates[0].content.parts[0].text;

    res.json({
      reply
    });

  } catch (err) {

    console.error(err.response?.data || err.message);

    res.status(500).json({
      reply: "AI server error"
    });

  }

}