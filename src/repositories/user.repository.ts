import { PrismaClient, Prisma } from '@prisma/client';

export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  
  // 사용자 ID로 사용자 조회
  async findUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { user_id: userId },
    });
  }

  // 사용자 업데이트
  async updateUser(userId: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { user_id: userId },
      data,
    });
  }

  // 사용자 생성
  async createUser(data: Prisma.UserCreateInput) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error: any) {
      // Prisma 오류 코드 확인
      if (error.code === 'P2002') {
        throw new Error('이미 사용 중인 이메일 또는 닉네임입니다.');
      }
      throw error;
    }
  }

  // 이메일로 사용자 조회
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // 마지막 로그인 시간 업데이트
  async updateLastLogin(userId: number, lastLogin: Date) {
    return this.prisma.user.update({
      where: { user_id: userId },
      data: { last_login: lastLogin },
    });
  }
}