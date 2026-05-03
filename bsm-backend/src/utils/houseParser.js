export function extractHouse(question, houses){

  if(!question || !houses) return null;

  const lower = question.toLowerCase().trim();

  // 🚫 các từ dễ gây match sai
  const blacklist = ["thu", "so", "số", "phong", "phòng", "doanh", "tong", "tổng"];

  for(const house of houses){

    const name = house.name.toLowerCase().trim();

    // ❌ bỏ tên quá ngắn
    if(name.length < 3) continue;

    // ❌ bỏ từ nằm trong blacklist
    if(blacklist.includes(name)) continue;

    // ✅ match nguyên từ (quan trọng nhất)
    const regex = new RegExp(`\\b${name}\\b`, "i");

    if(regex.test(lower)){
      return house.name;
    }
  }

  return null;
}
export function extractName(question){

  const patterns = [
    /(.+)\s+ở phòng/i,
    /tên\s+(.+)/i,
    /người\s+(.+)/i
  ]

  for(const regex of patterns){
    const match = question.match(regex)
    if(match) return match[1].trim()
  }

  return null
}