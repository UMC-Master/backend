import { Prisma, PrismaClient } from '@prisma/client';

export class PolicyRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: Prisma.MagazineCreateInput) {
    return await this.prisma.magazine.create({
      data,
      include: {
        organization: true,
        location: true,
      },
    });
  }

  async update(id: number, data: Prisma.MagazineUpdateInput) {
    return await this.prisma.magazine.update({
      data,
      where: {
        magazine_id: id,
      },
    });
  }

  async delete(id: number) {
    await this.prisma.magazine.delete({
      where: {
        magazine_id: id,
      },
    });
  }

  async getById(id: number) {
    return await this.prisma.magazine.findFirst({
      where: {
        magazine_id: id,
      },
      include: {
        organization: true,
        location: true,
      },
    });
  }

  async getByLocation(location: Prisma.LocationWhereInput) {
    return await this.prisma.magazine.findMany({
      select: {
        magazine_id: true,
        title: true,
        magazine_images: true,
      },
      where: {
        location,
      },
    });
  }
}
