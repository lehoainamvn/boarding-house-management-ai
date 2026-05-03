export function validateSQL(sql) {

  if (!sql) {
    throw new Error("SQL rỗng");
  }

  const lowerSQL = sql.toLowerCase();

  /* ===== CHỈ CHO PHÉP SELECT ===== */

  if (!lowerSQL.startsWith("select")) {
    throw new Error("Chỉ cho phép SELECT");
  }

  /* ===== NGĂN SQL NGUY HIỂM ===== */

  const blocked = [
    "drop",
    "delete",
    "update",
    "insert",
    "alter",
    "truncate"
  ];

  for (const word of blocked) {
    if (lowerSQL.includes(word)) {
      throw new Error("SQL nguy hiểm bị chặn");
    }
  }

  /* ===== BẢNG ĐƯỢC PHÉP ===== */

  const allowedTables = [
    "users",
    "houses",
    "rooms",
    "tenant_rooms",
    "invoices",
    "payments",
    "meter_readings"
  ];

  const hasTable = allowedTables.some(table =>
    lowerSQL.includes(table)
  );

  if (!hasTable) {
    throw new Error("Bảng không hợp lệ");
  }

  return sql;
}