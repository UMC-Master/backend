import { PrismaClient } from '@prisma/client';

export class LocationRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getById(id: number) {
    return await this.prisma.location.findFirst({
      where: {
        location_id: id,
      },
    });
  }

  async getByName(name: string) {
    return await this.prisma.location.findFirst({
      where: {
        name,
      },
    });
  }

  async createLocation(name: string, parent_id: number) {
    return await this.prisma.location.create({
      data: {
        parent_id: parent_id,
        name: name,
      },
      include: {
        parent: true,
      },
    });
  }
}
