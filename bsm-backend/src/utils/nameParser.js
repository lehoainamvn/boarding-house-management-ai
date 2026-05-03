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