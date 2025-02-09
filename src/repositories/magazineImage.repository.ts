import { PrismaClient } from '@prisma/client';

export class MagazineImageRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(magazine_id: number, url: string) {
    return await this.prisma.magazineImage.create({
      data: {
        magazine_id,
        image_url: url,
      },
    });
  }

  async getByMagazineId(magazine_id: number) {
    return await this.prisma.magazineImage.findMany({
      where: {
        magazine_id,
      },
    });
  }
}
