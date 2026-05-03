import { askGroq } from "./groq.service.js"

export async function detectTenantIntent(question){

  const prompt = `
Bạn là AI phân loại câu hỏi cho hệ thống nhà trọ.

Các intent:

ROOM_INFO
INVOICE
ELECTRIC_WATER
DEBT
PERSONAL_INFO
HOUSE_INFO
CHAT

Chỉ trả về đúng tên intent.

Câu hỏi:
${question}
`

  const result = await askGroq(prompt)

  return result.trim()

}