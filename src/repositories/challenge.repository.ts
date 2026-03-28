import { PrismaClient } from '@prisma/client';

export class ChallengeRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll() {
    return await this.prisma.challenge.findMany();
  }

  async findOngoing() {
    const now = new Date();
    return await this.prisma.challenge.findFirst({
      where: {
        start_date: {
          lte: now,
        },
        end_date: {
          gte: now,
        },
      },
    });
  }

  async findById(challenge_id: number) {
    return await this.prisma.challenge.findUnique({
      where: { challenge_id },
    });
  }

  async create(data) {
    return await this.prisma.challenge.create({
      data,
    });
  }

  async update(challenge_id: number, data) {
    return await this.prisma.challenge.update({
      where: { challenge_id },
      data,
    });
  }
}
