import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminRepository {
  // 관리자 생성
  async createAdmin(email: string, hashedPassword: string) {
    return await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN', // 관리자 계정으로 설정
      },
    });
  }

  // 이메일로 관리자 조회
  async findAdminByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // 비밀번호 업데이트
  async updatePassword(userId: number, newPassword: string) {
    return await prisma.user.update({
      where: { user_id: userId },
      data: { password: newPassword },
    });
  }
}