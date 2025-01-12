import { PrismaClient } from '@prisma/client';

export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createUser(data: unknown) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      // Prisma 오류 코드 직접 확인
      if (error.code === 'P2002') {
        throw new Error('이미 사용 중인 이메일 또는 닉네임입니다.');
      }
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateLastLogin(userId: number, lastLogin: Date) {
    return this.prisma.user.update({
      where: { user_id: userId },
      data: { last_login: lastLogin },
    });
  }
}
