import { PrismaClient } from '@prisma/client';

export class HashtagRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getById(hashtag_id: number) {
    return await this.prisma.hashtag.findFirst({
      where: {
        hashtag_id,
      },
    });
  }
}
