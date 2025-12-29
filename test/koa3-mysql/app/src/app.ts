import Koa from "koa"
import Router from "@koa/router"
import bodyParser from "koa-bodyparser"
import mysql from "mysql"
import mysql2 from "mysql2"

const mysqlConfig = {
  host: "mysql",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}

type MaybeMysqlError = mysql.MysqlError | mysql2.QueryError | null | undefined

interface MysqlConnection {
  connect(callback: (err: MaybeMysqlError) => void): void
  query(
    sql: string,
    callback: (err: MaybeMysqlError, rows: any, fields: any) => void
  ): void
  end(callback: (err: MaybeMysqlError) => void): void
}

function connectionPromise(mysqlClient: MysqlModule): Promise<MysqlConnection> {
  return new Promise((resolve, reject) => {
    const connection = mysqlClient.createConnection(mysqlConfig)

    connection.connect((err: MaybeMysqlError) => {
      if (err) reject(err)
      resolve(connection)
    })
  })
}

function dummyQueryPromise(connection: MysqlConnection): Promise<any> {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT 1 + 1 AS solution",
      (err: MaybeMysqlError, rows: any, _fields: any) => {
        if (err) reject(err)
        try {
          resolve(rows[0].solution)
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}

function endConnectionPromise(connection: MysqlConnection): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    connection.end((err: MaybeMysqlError) => {
      if (err) reject(err)
      resolve()
    })
  })
}

async function dummyQuery(mysqlClient: MysqlModule): Promise<any> {
  const connection = await connectionPromise(mysqlClient)
  const result = await dummyQueryPromise(connection)
  await endConnectionPromise(connection)

  return result
}

interface MysqlModule {
  createConnection(config: typeof mysqlConfig): MysqlConnection
}

const mysqlModule: MysqlModule = mysql
const mysql2Module: MysqlModule = mysql2

const app = new Koa()
const router = new Router()
const port = process.env.PORT

app.use(bodyParser())

router.get("/get", async (ctx: any) => {
  ctx.body = "GET query received!"
})

router.get("/error", async (_ctx: any) => {
  throw new Error("Expected test error!")
})

router.get("/mysql-query", async (ctx: any) => {
  await dummyQuery(mysqlModule)

  ctx.body = "MySQL query received!"
})

router.get("/mysql2-query", async (ctx: any) => {
  await dummyQuery(mysql2Module)

  ctx.body = "MySQL2 query received!"
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(port)
console.log(`Example app listening on port ${port}`)
