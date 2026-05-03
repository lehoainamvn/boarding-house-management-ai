import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function askGroq(prompt) {

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
Bạn là AI trợ lý cho hệ thống quản lý phòng trọ BSM.
Chỉ trả lời dựa vào dữ liệu hệ thống.
Nếu không có dữ liệu hãy nói không tìm thấy.
`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3
  });

  return completion.choices[0].message.content;
}