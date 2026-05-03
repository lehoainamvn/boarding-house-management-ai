export function validateSQL(sql){

  const lowerSQL = sql.toLowerCase()

  /* ❌ CHẶN QUERY NGUY HIỂM */
  if(
    lowerSQL.includes("drop") ||
    lowerSQL.includes("delete") ||
    lowerSQL.includes("update") ||
    lowerSQL.includes("insert")
  ){
    throw new Error("SQL nguy hiểm")
  }

  /* 🔥 BẮT BUỘC OWNER_ID */
  if(!lowerSQL.includes("h.owner_id")){
    throw new Error("Thiếu filter owner_id")
  }

  /* 🔥 BẮT BUỘC JOIN CHUẨN */
  if(!lowerSQL.includes("from rooms")){
    throw new Error("Sai cấu trúc FROM")
  }

  return sql
}