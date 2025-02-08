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

  async findByUserIdANdMagazineId(user_id: number, magazine_id: number) {
    return await this.prisma.magazineBookmark.findFirst({
      where: {
        user_id,
        magazine_id,
      },
    });
  }

  async delete(magazine_bookmark_id: number) {
    return await this.prisma.magazineBookmark.delete({
      where: {
        magazine_bookmark_id,
      },
    });
  }

  async create(user_id: number, magazine_id: number) {
    return await this.prisma.magazineBookmark.create({
      data: {
        user_id,
        magazine_id,
      },
    });
  }

}
