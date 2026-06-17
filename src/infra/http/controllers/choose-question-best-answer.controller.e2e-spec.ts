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
import { AnswerFactory } from "test/factories/make-answer"

describe("Choose question best answer (E2E)", () => {
  let app: INestApplication
  let prisma: PrismaService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[PATCH] /answers/:answerId/choose-as-best", async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id,
      authorId: user.id,
    })

    const answerId = answer.id.toString()

    const response = await request(app.getHttpServer() as Server)
      .patch(`/answers/${answerId}/choose-as-best`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "New answer content",
      })

    expect(response.statusCode).toBe(204)

    const questionOnDatabase = await prisma.question.findFirst({
      where: {
        id: question.id.toString(),
      },
    })

    expect(questionOnDatabase?.bestAnswerId).toEqual(answerId)
  })
})
