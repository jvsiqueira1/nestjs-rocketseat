import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "@/auth/jwt-auth.guard"
import { ZodValidationPipe } from "@/pipes/zod-validation-pipe"

import z from "zod"
import { PrismaService } from "../prisma/prisma.service"

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1))

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller("/questions")
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(
    @Query("page", new ZodValidationPipe(pageQueryParamSchema))
    page: PageQueryParamSchema,
  ) {
    const perPage = 20

    const questions = await this.prisma.question.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: "desc",
      },
    })

    return { questions }
  }
}
