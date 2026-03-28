import { PrismaClient } from '@prisma/client';

export class ChallengeAttemptRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data) {
    return await this.prisma.challengeAttempt.create({
      data,
    });
  }

  async findById(attempt_id: number) {
    return await this.prisma.challengeAttempt.findUnique({
      where: { attempt_id },
    });
  }

  async findByChallengeAndUser(challenge_id: number, user_id: number) {
    return await this.prisma.challengeAttempt.findFirst({
      where: {
        challenge_id,
        user_id,
      },
    });
  }

  async update(attempt_id: number, data) {
    return await this.prisma.challengeAttempt.update({
      where: { attempt_id },
      data,
    });
  }
}
