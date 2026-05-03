export function generateInsight(history, prediction) {

  const insights = {}

  if(history.length < 2) return insights

  const last = history[history.length-1].revenue
  const next = prediction[0]?.revenue || 0

  /* Doanh thu tháng tới */

  const change = ((next-last)/last)*100

  insights.nextMonthGrowth = change.toFixed(1)

  return insights

}