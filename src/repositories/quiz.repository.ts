import { PrismaClient } from '@prisma/client';

export class QuizRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data) {
    return await this.prisma.quiz.create({
      data,
    });
  }

  async getRandom(limit: number): Promise<
    {
      quiz_id: number;
      question: string;
      correct_answer: boolean;
      description: string;
    }[]
  > {
    return await this.prisma.$queryRaw<
      {
        quiz_id: number;
        question: string;
        correct_answer: boolean;
        description: string;
      }[]
    >`
    SELECT * FROM quiz 
    ORDER BY RAND() 
    LIMIT ${limit};
  `;
  }

  async getById(id) {
    return await this.prisma.quiz.findFirst({
      where: {
        quiz_id: +id,
      },
    });
  }
}
