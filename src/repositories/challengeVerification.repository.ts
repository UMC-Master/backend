import { PrismaClient } from '@prisma/client';

export class ChallengeVerificationRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data) {
    return await this.prisma.challengeVerification.create({
      data,
    });
  }

  async findById(verification_id: number) {
    return await this.prisma.challengeVerification.findUnique({
      where: { verification_id },
    });
  }

  async findByAttemptId(attempt_id: number) {
    return await this.prisma.challengeVerification.findFirst({
      where: { attempt_id },
    });
  }

  async update(verification_id: number, data) {
    return await this.prisma.challengeVerification.update({
      where: { verification_id },
      data,
    });
  }
}
