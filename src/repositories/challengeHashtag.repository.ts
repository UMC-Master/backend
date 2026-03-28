import { PrismaClient } from '@prisma/client';

export class ChallengeHashtagRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getHashtagsByChallengeId(challenge_id: number) {
    return await this.prisma.challengeHashtag.findMany({
      where: {
        challenge_id,
      },
    });
  }
}
