import { config } from "dotenv"
import { randomUUID } from "node:crypto"
import { execSync } from "node:child_process"
import { PrismaPg } from "@prisma/adapter-pg"
import { afterAll, beforeAll } from "vitest"
import { PrismaClient } from "../generated/prisma/client"

config({ path: ".env", override: true })
config({ path: ".env.test", override: true })

const schemaId = randomUUID()

function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("Please provide a DATABASE_URL environment variable.")
  }

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set("schema", schemaId)

  return url.toString()
}

const databaseURL = generateUniqueDatabaseURL(schemaId)

// No Prisma 7 (driver adapters) o `?schema=` da connection string é ignorado
// pelo client em runtime — o schema precisa ser passado explicitamente ao adapter.
const adapter = new PrismaPg(
  { connectionString: databaseURL },
  { schema: schemaId },
)

const prisma = new PrismaClient({ adapter })

beforeAll(() => {
  process.env.DATABASE_URL = databaseURL

  // O CLI do Prisma (migrate) ainda lê o `?schema=` da DATABASE_URL.
  execSync("pnpm prisma migrate deploy")
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
