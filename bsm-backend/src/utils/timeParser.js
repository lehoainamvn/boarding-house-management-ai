export function parseTime(question){

  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth()+1).padStart(2,"0")

  if(question.includes("tháng này")){
    return `${year}-${month}`
  }

  if(question.includes("tháng trước")){

    const prev = new Date()
    prev.setMonth(prev.getMonth()-1)

    const y = prev.getFullYear()
    const m = String(prev.getMonth()+1).padStart(2,"0")

    return `${y}-${m}`
  }

  return null

}