import { PrismaClient } from '@prisma/client';

export class MagazineBookmarkRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getCountByMagazineId(magazine_id: number) {
    return await this.prisma.magazineBookmark.count({
      where: {
        magazine_id,
      },
    });
  }
}
