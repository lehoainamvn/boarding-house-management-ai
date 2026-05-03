export function formatResult(question, sql, data) {

  const lowerSQL = sql.toLowerCase()

  /* ===== COUNT ===== */

  if (lowerSQL.includes("count(")) {

    const value = Object.values(data[0])[0]

    if(question.includes("phòng"))
      return `Hiện có **${value} phòng** trong hệ thống.`

    if(question.includes("nhà"))
      return `Hiện có **${value} nhà trọ**.`

    if(question.includes("hóa đơn"))
      return `Có **${value} hóa đơn**.`

    return `Kết quả là **${value}**.`
  }

  /* ===== SUM ===== */

  if (lowerSQL.includes("sum(")) {

    const value = Object.values(data[0])[0] || 0

    return `💰 Tổng doanh thu là **${value.toLocaleString()} đồng**.`
  }

  /* ===== ROOM LIST ===== */

  if (data[0].room_name) {

    const rooms = data.map(r => `• ${r.room_name}`)

    return `Các phòng tìm thấy:\n${rooms.join("\n")}`
  }

  /* ===== HOUSE LIST ===== */

  if (data[0].name) {

    const houses = data.map(h => `• ${h.name}`)

    return `Danh sách nhà trọ:\n${houses.join("\n")}`
  }

  return JSON.stringify(data)
}