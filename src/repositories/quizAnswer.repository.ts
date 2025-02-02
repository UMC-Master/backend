import { PrismaClient } from "@prisma/client";

export class QuizAnswerRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data) {
    return await this.prisma.quizAnswer.create({
      data,
    });
  }
}
