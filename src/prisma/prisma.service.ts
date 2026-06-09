import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/prisma/client"

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL

    // Em produção a URL não tem `?schema=` (usa o `public`); nos testes e2e o
    // setup injeta um schema único. Com driver adapter o schema só é aplicado
    // se passado explicitamente nas opções do adapter.
    const schema = connectionString
      ? (new URL(connectionString).searchParams.get("schema") ?? undefined)
      : undefined

    const adapter = new PrismaPg(
      { connectionString },
      schema ? { schema } : undefined,
    )

    super({
      adapter,
      log: ["warn", "error"],
    })
  }

  onModuleInit() {
    return this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }
}
