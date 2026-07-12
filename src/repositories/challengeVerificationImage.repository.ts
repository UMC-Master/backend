import { PrismaClient } from '@prisma/client';

export class ChallengeVerificationImageRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data) {
    return await this.prisma.challengeVerificationImage.create({
      data,
    });
  }

  async findById(image_id: number) {
    return await this.prisma.challengeVerificationImage.findUnique({
      where: { image_id },
    });
  }

  async findByVerificationId(verification_id: number) {
    return await this.prisma.challengeVerificationImage.findMany({
      where: { verification_id },
    });
  }
}
