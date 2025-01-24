import { PrismaClient } from '@prisma/client';

export class MagazineHashtagRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createMagazineHashtag(magazine_id, hashtag_id) {
    return await this.prisma.magazineHashtag.create({
      data: {
        magazine_id,
        hashtag_id,
      },
      include: {
        hashtag: true,
      },
    });
  }

  async getHashtagsByPolicyId(magazine_id: number) {
    return await this.prisma.magazineHashtag.findMany({
      where: {
        magazine_id,
      },
      include: {
        hashtag: true,
      },
    });
  }
}
