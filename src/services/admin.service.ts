import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AdminRepository } from '../repositories/admin.repository';
import { UnauthorizedError, ValidationError } from '../errors';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  // 관리자 생성
  async createAdmin(email: string, password: string) {
    const existingAdmin = await this.adminRepository.findAdminByEmail(email);
    if (existingAdmin) {
      throw new ValidationError('이미 존재하는 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.adminRepository.createAdmin(email, hashedPassword);
  }

  // 관리자 로그인
  async loginAdmin(email: string, password: string) {
    const admin = await this.adminRepository.findAdminByEmail(email);
    if (!admin || admin.role !== 'ADMIN') {
      throw new UnauthorizedError('관리자 계정이 아니거나 존재하지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedError('비밀번호가 일치하지 않습니다.');
    }

    const token = jwt.sign(
      { userId: admin.user_id, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return { accessToken: token };
  }

  // 비밀번호 변경
  async updatePassword(userId: number, oldPassword: string, newPassword: string) {
    const admin = await this.adminRepository.findAdminByEmail(userId.toString());
    if (!admin || admin.role !== 'ADMIN') {
      throw new UnauthorizedError('관리자 계정이 아니거나 존재하지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, admin.password!);
    if (!isPasswordValid) {
      throw new ValidationError('기존 비밀번호가 일치하지 않습니다.');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.adminRepository.updatePassword(userId, hashedNewPassword);

    return { message: '비밀번호가 성공적으로 변경되었습니다.' };
  }
}