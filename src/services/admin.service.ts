import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AdminRepository } from '../repositories/admin.repository';
import { UnauthorizedError, ValidationError } from '../errors';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  /**
   * 관리자 생성
   * @param email - 관리자 이메일
   * @param password - 관리자 비밀번호
   * @returns 생성된 관리자 정보
   */
  async createAdmin(email: string, password: string) {
    const existingAdmin = await this.adminRepository.findAdminByEmail(email);
    if (existingAdmin) {
      throw new ValidationError('이미 존재하는 이메일입니다.', { email });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await this.adminRepository.createAdmin(email, hashedPassword);

    return {
      message: '관리자 계정이 성공적으로 생성되었습니다.',
      admin: { userId: newAdmin.user_id, email: newAdmin.email },
    };
  }

  /**
   * 관리자 로그인
   * @param email - 관리자 이메일
   * @param password - 관리자 비밀번호
   * @returns 액세스 토큰
   */
  async loginAdmin(email: string, password: string) {
    const admin = await this.adminRepository.findAdminByEmail(email);
    if (!admin || admin.role !== 'ADMIN') {
      throw new UnauthorizedError('관리자 계정이 아니거나 존재하지 않습니다.', { email });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedError('비밀번호가 일치하지 않습니다.', { email });
    }

    const token = jwt.sign(
      { userId: admin.user_id, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return {
      message: '로그인 성공',
      accessToken: token,
    };
  }

  /**
   * 비밀번호 변경
   * @param userId - 관리자 ID
   * @param oldPassword - 기존 비밀번호
   * @param newPassword - 새 비밀번호
   * @returns 비밀번호 변경 메시지
   */
  async updatePassword(userId: number, oldPassword: string, newPassword: string) {
    const admin = await this.adminRepository.findAdminById(userId);

    if (!admin || admin.role !== 'ADMIN') {
      throw new UnauthorizedError('관리자 계정이 아니거나 존재하지 않습니다.', { userId });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, admin.password!);
    if (!isPasswordValid) {
      throw new ValidationError('기존 비밀번호가 일치하지 않습니다.', { userId });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.adminRepository.updatePassword(userId, hashedNewPassword);

    return { message: '비밀번호가 성공적으로 변경되었습니다.' };
  }
}