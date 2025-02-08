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

  async findByUserIdANdMagazineId(user_id: number, magazine_id: number) {
    return await this.prisma.magazineLike.findFirst({
      where: {
        user_id,
        magazine_id,
      },
    });
  }

  async delete(magazine_like_id: number) {
    return await this.prisma.magazineLike.delete({
      where: {
        magazine_like_id,
      },
    });
  }

  async create(user_id: number, magazine_id: number) {
    return await this.prisma.magazineLike.create({
      data: {
        user_id,
        magazine_id,
      },
    });
  }
}
