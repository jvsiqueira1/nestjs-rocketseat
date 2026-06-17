import type { Server } from "node:http"
import { AppModule } from "@/infra/app.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { JwtService } from "@nestjs/jwt"
import { StudentFactory } from "test/factories/make-student"
import { DatabaseModule } from "@/infra/database/database.module"
import { QuestionFactory } from "test/factories/make-question"

describe("Edit question (E2E)", () => {
  let app: INestApplication
  let prisma: PrismaService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[PUT] /questions/:id", async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const questionId = question.id.toString()

    const response = await request(app.getHttpServer() as Server)
      .put(`/questions/${questionId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "New title",
        content: "New content",
      })

    expect(response.statusCode).toBe(204)

    const questionOnDatabase = await prisma.question.findFirst({
      where: {
        title: "New title",
        content: "New content",
      },
    })

    expect(questionOnDatabase).toBeTruthy()
  })
})
