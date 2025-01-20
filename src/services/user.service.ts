import axios from 'axios';
import { UserRepository } from '../repositories/user.repository';
import { EmailSignupDto, ProfileUpdateDto } from '../dtos/user.dto'; // 사용 중인 DTO만 남김
import { ValidationError, UnauthorizedError } from '../errors'; // 필요한 에러 클래스만 남김
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // 이메일 회원가입
  async emailSignup(data: EmailSignupDto) {
    if (!data.email || !data.password || !data.nickname) {
      throw new ValidationError('이메일, 비밀번호, 닉네임은 필수 항목입니다.', data);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.createUser({
      ...data,
      password: hashedPassword,
      status: 'ACTIVE',
    });

    return user;
  }

  // 이메일 로그인
  async loginUser(email: string, password: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new ValidationError('이메일 또는 비밀번호가 잘못되었습니다.', null);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ValidationError('이메일 또는 비밀번호가 잘못되었습니다.', null);
    }

    const accessToken = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // 프로필 조회
  async getProfile(userId: number) {
    const profile = await this.userRepository.findUserById(userId);
    if (!profile) {
      throw new ValidationError('사용자를 찾을 수 없습니다.', null);
    }

    const { password, ...safeProfile } = profile;
    return safeProfile;
  }

  // 프로필 업데이트
  async updateProfile(userId: number, data: ProfileUpdateDto) {
    return this.userRepository.updateUser(userId, data);
  }

  // 카카오 로그인
  public async kakaoLogin(kakaoAccessToken: string) {
    // Step 1: 카카오 사용자 정보 가져오기
    const kakaoUserInfo = await this.getKakaoUserInfo(kakaoAccessToken);
  
    // Step 2: 사용자 데이터베이스 확인 또는 생성
    const user = await this.userRepository.findOrCreate({
      email: kakaoUserInfo.email,
      nickname: kakaoUserInfo.nickname,
      provider: 'kakao',
      providerId: kakaoUserInfo.id,
      status: 'ACTIVE',
    });
  
    // Step 3: JWT 토큰 생성
    const accessToken = this.generateAccessToken({ id: user.user_id, email: user.email });
    const refreshToken = this.generateRefreshToken({ id: user.user_id });
  
    return { accessToken, refreshToken };
  }
  
  private async getKakaoUserInfo(accessToken: string) {
    try {
      const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = response.data;
      if (!data || !data.kakao_account) {
        throw new Error('유효하지 않은 카카오 Access Token입니다.');
      }
      return {
        id: data.id,
        email: data.kakao_account.email,
        nickname: data.kakao_account.profile.nickname,
      };
    } catch (error) {
      throw new Error('카카오 사용자 정보 요청 실패');
    }
  }
  

  // 비밀번호 재설정 요청
  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new ValidationError('등록된 이메일이 없습니다.', email);
    }

    const resetToken = jwt.sign({ userId: user.user_id }, process.env.JWT_RESET_SECRET!, { expiresIn: '1h' });

    // 개발 중에 토큰을 출력 (배포 환경에서는 제거해야 함)
    console.log(`Generated Reset Token: ${resetToken}`);

    // 이메일 발송 로직 (예: 외부 이메일 서비스 사용)
    await this.sendPasswordResetEmail(user.email, resetToken);

    return { message: '비밀번호 재설정 이메일이 발송되었습니다.' };
  }

  // 비밀번호 재설정
  async resetPassword(resetToken: string, newPassword: string) {
    try {
      const payload = jwt.verify(resetToken, process.env.JWT_RESET_SECRET!) as { userId: number };

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.userRepository.updateUser(payload.userId, { password: hashedPassword });

      return { message: '비밀번호가 성공적으로 변경되었습니다.' };
    } catch (error) {
      throw new ValidationError('유효하지 않은 또는 만료된 토큰입니다.', null);
    }
  }

  // 회원 탈퇴
  async deactivateAccount(userId: number) {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new ValidationError('사용자를 찾을 수 없습니다.', userId);
    }

    await this.userRepository.updateUser(userId, { status: 'INACTIVE' });

    return { message: '계정이 비활성화되었습니다.' };
  }

  // 회원 계정 재활성화 
  async reactivateAccount(userId: number) {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new ValidationError('사용자를 찾을 수 없습니다.', userId);
    }
  
    if (user.status === 'ACTIVE') {
      throw new ValidationError('계정이 이미 활성화되어 있습니다.', userId);
    }
  
    // 상태를 활성화로 변경
    await this.userRepository.updateUser(userId, { status: 'ACTIVE' });
  
    return { message: '계정이 성공적으로 활성화되었습니다.' };
  }
  

  // 사용자 통계 조회
  async getStatistics(userId: number) {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new ValidationError('사용자를 찾을 수 없습니다.', userId);
    }

    return {
      quizScore: 85,
      tipsSharedCount: 12,
      likesReceived: 45,
    };
  }

  // 토큰 갱신
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: number };

      const user = await this.userRepository.findUserById(payload.userId);
      if (!user) {
        throw new ValidationError('사용자를 찾을 수 없습니다.', null);
      }

      const accessToken = this.generateAccessToken({ id: user.user_id, email: user.email });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError('유효하지 않은 또는 만료된 Refresh Token입니다.', null);
    }
  }

  private generateAccessToken(payload: { id: number; email?: string }) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' });
  }

  private generateRefreshToken(payload: { id: number }) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });
  }

  private async sendPasswordResetEmail(email: string, resetToken: string) {
    console.log(`Password reset email sent to ${email} with token: ${resetToken}`);
  }
}