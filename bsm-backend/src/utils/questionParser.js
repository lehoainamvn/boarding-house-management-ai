export function normalizeQuestion(question){

  let q = question.toLowerCase()

  const now = new Date()

  const currentMonth = now.toISOString().slice(0,7)

  /* tháng này */

  q = q.replace("tháng này",currentMonth)
  q = q.replace("thang nay",currentMonth)

  /* tháng 2 */

  const year = now.getFullYear()

  q = q.replace("tháng 2",`${year}-02`)
  q = q.replace("tháng 3",`${year}-03`)
  q = q.replace("tháng 4",`${year}-04`)

  /* tháng 2/2026 */

  q = q.replace("2/2026","2026-02")
  q = q.replace("3/2026","2026-03")

  return q
}