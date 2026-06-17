import type { Server } from "node:http"
import { AppModule } from "@/infra/app.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { JwtService } from "@nestjs/jwt"
import { StudentFactory } from "test/factories/make-student"
import { DatabaseModule } from "@/infra/database/database.module"

describe("Create question (E2E)", () => {
  let app: INestApplication
  let prisma: PrismaService
  let studentFactory: StudentFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[POST] /questions", async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer() as Server)
      .post("/questions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "New question",
        content: "Question content",
      })

    expect(response.statusCode).toBe(201)

    const questionOnDatabase = await prisma.question.findFirst({
      where: {
        authorId: user.id.toString(),
      },
    })

    expect(questionOnDatabase).toBeTruthy()
  })
})
