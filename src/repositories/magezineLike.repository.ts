import { PrismaClient } from '@prisma/client';

export class MagazineLikeRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getCountByMagazineId(magazine_id: number) {
    return await this.prisma.magazineLike.count({
      where: {
        magazine_id,
      },
    });
  }
}
