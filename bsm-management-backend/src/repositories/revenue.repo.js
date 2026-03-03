import sql from "mssql";
import { poolPromise } from "../config/db.js";

export async function getRevenueRepo(ownerId, year, month, houseId) {
  const pool = await poolPromise;

  let monthCondition = "";
  let houseCondition = "";

  if (month) {
    monthCondition = "AND MONTH(i.created_at) = @month";
  }
  if (houseId) {
    houseCondition = "AND r.house_id = @house_id";
  }

  const request = pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("year", sql.Int, year);

  if (month) request.input("month", sql.Int, month);
  if (houseId) request.input("house_id", sql.Int, houseId);

  const result = await request.query(`
    SELECT
      FORMAT(i.created_at, 'MM') AS period,
      COUNT(*) AS total_invoices,
      SUM(i.total_amount) AS total_revenue
    FROM invoices i
    JOIN rooms r ON i.room_id = r.id
    WHERE r.owner_id = @owner_id
      AND YEAR(i.created_at) = @year
      ${monthCondition}
      ${houseCondition}
    GROUP BY FORMAT(i.created_at, 'MM')
    ORDER BY period
  `);

  return result.recordset;
}

export async function getRevenueSummaryRepo(ownerId, year, houseId) {
  const pool = await poolPromise;

  let houseCondition = "";
  if (houseId) {
    houseCondition = "AND r.house_id = @house_id";
  }

  const request = pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("year", sql.Int, year);

  if (houseId) request.input("house_id", sql.Int, houseId);

  const result = await request.query(`
    SELECT
      -- Tổng khách thuê thuộc owner
      (
        SELECT COUNT(*)
        FROM users u
        JOIN tenant_rooms tr ON u.id = tr.tenant_id
        JOIN rooms r ON tr.room_id = r.id
        WHERE u.role = 'TENANT'
          AND r.owner_id = @owner_id
      ) AS totalTenants,

      -- Tổng nhà
      (
        SELECT COUNT(*)
        FROM houses
        WHERE owner_id = @owner_id
      ) AS totalHouses,

      -- Tổng phòng
      (
        SELECT COUNT(*)
        FROM rooms r
        WHERE r.owner_id = @owner_id
        ${houseCondition}
      ) AS totalRooms,

      -- Phòng trống (không có tenant đang thuê)
      (
        SELECT COUNT(*)
        FROM rooms r
        WHERE r.owner_id = @owner_id
          AND NOT EXISTS (
            SELECT 1
            FROM tenant_rooms tr
            WHERE tr.room_id = r.id
              AND tr.end_date IS NULL
          )
          ${houseCondition}
      ) AS emptyRooms,

      -- Tổng hóa đơn năm
      (
        SELECT COUNT(*)
        FROM invoices i
        JOIN rooms r ON i.room_id = r.id
        WHERE r.owner_id = @owner_id
          AND YEAR(i.created_at) = @year
          ${houseCondition}
      ) AS totalInvoices,

      -- Hóa đơn chưa thanh toán
      (
        SELECT COUNT(*)
        FROM invoices i
        JOIN rooms r ON i.room_id = r.id
        WHERE r.owner_id = @owner_id
          AND i.status = 'UNPAID'
          AND YEAR(i.created_at) = @year
          ${houseCondition}
      ) AS unpaidInvoices,

      -- Tổng doanh thu năm
      (
        SELECT ISNULL(SUM(i.total_amount), 0)
        FROM invoices i
        JOIN rooms r ON i.room_id = r.id
        WHERE r.owner_id = @owner_id
          AND YEAR(i.created_at) = @year
          ${houseCondition}
      ) AS totalRevenue
  `);

  return result.recordset[0];
}

export async function getRoomRevenueByMonth(ownerId, year, month) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("year", sql.Int, year)
    .input("month", sql.Int, month)
    .query(`
      SELECT 
        r.room_name,
        SUM(i.total_amount) AS revenue
      FROM invoices i
      JOIN rooms r ON i.room_id = r.id
      WHERE r.owner_id = @owner_id
        AND YEAR(i.created_at) = @year
        AND MONTH(i.created_at) = @month
      GROUP BY r.room_name
      ORDER BY r.room_name
    `);

  return result.recordset;
}
export async function getRevenueByRoomRepo(ownerId, year, month, houseId) {
  const pool = await poolPromise;

  let houseCondition = "";
  if (houseId) {
    houseCondition = "AND r.house_id = @house_id";
  }

  const request = pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("year", sql.Int, year)
    .input("month", sql.Int, month);

  if (houseId) {
    request.input("house_id", sql.Int, houseId);
  }

  const result = await request.query(`
    SELECT
      r.room_name,
      ISNULL(SUM(i.total_amount), 0) AS total_revenue
    FROM rooms r
    LEFT JOIN invoices i
      ON i.room_id = r.id
      AND YEAR(i.created_at) = @year
      AND MONTH(i.created_at) = @month
    WHERE r.owner_id = @owner_id
      ${houseCondition}
    GROUP BY r.room_name
    ORDER BY r.room_name
  `);

  return result.recordset;
}

