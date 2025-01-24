import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminRepository {
  // 관리자 생성
  async createAdmin(email: string, hashedPassword: string) {
    try {
      const admin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'ADMIN', // 관리자 계정으로 설정
          status: 'ACTIVE', // status 필드 추가
        },
      });

      console.log('관리자 계정 생성 성공:', admin);
      return admin;
    } catch (error) {
      console.error('관리자 계정 생성 실패:', error);
      throw error;
    }
  }

  // 이메일로 관리자 조회
  async findAdminByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // ID로 관리자 조회
  async findAdminById(userId: number) {
    return await prisma.user.findUnique({
      where: { user_id: userId },
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