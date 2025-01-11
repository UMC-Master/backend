import { PrismaClient } from '@prisma/client';

export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createUser(data: any) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error: any) {
      // Prisma 오류 코드 직접 확인
      if (error.code === 'P2002') {
        throw new Error('이미 사용 중인 이메일 또는 닉네임입니다.');
      }
      throw error;
    }
  }
}
