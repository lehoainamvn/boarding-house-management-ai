import Groq from "groq-sdk"
import dotenv from "dotenv"

dotenv.config()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function detectIntent(question){

  const completion = await groq.chat.completions.create({

    model:"llama-3.3-70b-versatile",
    temperature:0,

    messages:[
      {
        role:"system",
        content:`
Phân loại câu hỏi của người dùng hệ thống quản lý nhà trọ.
Trả về ĐÚNG 1 trong 3 từ: CHAT, DATABASE, AMBIGUOUS

CHAT: Chào hỏi, hỏi bạn là ai, tâm sự, không liên quan nghiệp vụ
  Ví dụ: hello, xin chào, bạn là ai, tôi buồn, cảm ơn

AMBIGUOUS: Hỏi về phòng hoặc khách thuê TỔNG QUÁT mà KHÔNG nêu tên nhà cụ thể và KHÔNG có từ ngữ tham chiếu ngữ cảnh
  Ví dụ: tổng số phòng, số phòng là bao nhiêu, phòng trống, khách thuê hiện tại, danh sách phòng, còn bao nhiêu phòng
  NGOẠI LỆ - trả DATABASE nếu: câu có tên nhà cụ thể ("nhà Nam", "nhà A") HOẶC câu có từ tham chiếu ("đó", "này", "của họ", "chi tiết", "thêm", "xem thêm", "nói thêm", "thông tin chi tiết")

DATABASE: Hỏi về doanh thu, hóa đơn, điện nước, thanh toán, hoặc câu hỏi có tên nhà cụ thể, hoặc câu hỏi tiếp nối ngữ cảnh
  Ví dụ: doanh thu tháng này, phòng chưa thanh toán, điện nước tháng 3, thông tin chi tiết của khách đó, xem phòng nhà Nam, còn bao nhiêu phòng trống nhà A

CHỈ TRẢ VỀ 1 TỪ DUY NHẤT: CHAT hoặc DATABASE hoặc AMBIGUOUS
`
      },
      {
        role:"user",
        content: question
      }
    ]
  })

  return completion.choices[0].message.content.trim()

}