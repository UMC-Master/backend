import { PrismaClient } from '@prisma/client';

export class OrganizationRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getById(id: number) {
    return await this.prisma.organization.findFirst({
      where: {
        organization_id: +id,
      },
    });
  }

  async getByName(name: string) {
    return await this.prisma.organization.findFirst({
      where: {
        name,
      },
    });
  }

  async createOrganization(name: string, location_id: number) {
    return await this.prisma.organization.create({
      data: {
        location_id: location_id,
        name: name,
      },
      include: {
        location: true,
      },
    });
  }

  async getAll() {
    return await this.prisma.organization.findMany({
      include: {
        location: true,
      },
    });
  }
}
