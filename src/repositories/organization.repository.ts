import { PrismaClient } from '@prisma/client';

export class OrganizationRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getById(id: number) {
    return await this.prisma.organization.findFirst({
      where: {
        organization_id: id,
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
}
