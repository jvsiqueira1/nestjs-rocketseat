import {
  Question as PrismaQuestion,
  User as PrismaUser,
  Attachment as PrismaAttachment,
} from "generated/prisma/browser"
import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { QuestionDetails } from "@/domain/forum/enterprise/entities/value-objects/question-details"
import { Slug } from "@/domain/forum/enterprise/entities/value-objects/slug"
import { PrismaAttachmentMapper } from "./prisma-attachment-mapper"

type PrismaQuestionDetails = PrismaQuestion & {
  author: PrismaUser
  attachments: PrismaAttachment[]
}

export class PrismaQuestionDetailMapper {
  static toDomain(raw: PrismaQuestionDetails): QuestionDetails {
    return QuestionDetails.create({
      questionId: new UniqueEntityID(raw.id),
      authorId: new UniqueEntityID(raw.authorId),
      author: raw.author.name,
      content: raw.content,
      title: raw.title,
      slug: Slug.create(raw.slug),
      attachments: raw.attachments.map((attachment) =>
        PrismaAttachmentMapper.toDomain(attachment),
      ),
      bestAnswerId: raw.bestAnswerId
        ? new UniqueEntityID(raw.bestAnswerId)
        : null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }
}
