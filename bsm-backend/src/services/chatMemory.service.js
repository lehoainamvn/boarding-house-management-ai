import { poolPromise } from "../config/db.js"

export async function saveMessage(userId,role,message){

  const pool = await poolPromise

  await pool.request()
  .input("user",userId)
  .input("role",role)
  .input("msg",message)
  .query(`
    INSERT INTO ChatMessages(user_id,role,message)
    VALUES(@user,@role,@msg)
  `)

}

export async function getHistory(userId){

  const pool = await poolPromise

  const result = await pool.request()
  .input("user",userId)
  .query(`
    SELECT TOP 10 role,message
    FROM ChatMessages
    WHERE user_id=@user
    ORDER BY id DESC
  `)

  return result.recordset.reverse()

}