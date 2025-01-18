import { UserRepository } from '../repositories/user.repository';
import { EmailSignupDto, KakaoSignupDto } from '../dtos/user.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async emailSignup(data: EmailSignupDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.createUser({
      ...data,
      password: hashedPassword,
      login_type: 'EMAIL',
      status: 'ACTIVE', // status 기본값 추가
    });

    return user;
  }

  async kakaoSignup(data: KakaoSignupDto) {
    if (!data.email) {
      throw new Error('카카오 로그인 시 이메일은 필수입니다.');
    }
  
    const user = await this.userRepository.createUser({
      email: data.email,
      password: '', // 카카오 로그인의 경우 비밀번호를 비워 둠
      login_type: 'KAKAO',
      status: 'ACTIVE',
      nickname: data.nickname || null, // 선택적 nickname 처리
      city: data.city || null, // 선택적 city 처리
      district: data.district || null, // 선택적 district 처리
    });
  
    return user;
  }

  async getProfile(userId: number) {
    // 사용자 정보를 DB에서 조회
    const profile = await this.userRepository.findUserById(userId);

    // 비밀번호를 제외한 안전한 프로필 데이터 반환
    if (profile) {
      const { password, ...safeProfile } = profile;
      return safeProfile;
    }

    throw new Error('사용자를 찾을 수 없습니다.');
  }

  async updateProfile(userId: number, data: Partial<EmailSignupDto>) {
    return this.userRepository.updateUser(userId, data);
  }

  async getStatistics(userId: number) {
    // 사용자 통계 정보 조회 로직 (가상)
    return {
      quiz_score: 85,
      tips_shared_count: 12,
      likes_received: 45,
    };
  }

  async loginUser(email: string, password: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    await this.userRepository.updateLastLogin(user.user_id, new Date());

    const accessToken = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}