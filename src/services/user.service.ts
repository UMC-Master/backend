import axios from 'axios';
import { UserRepository } from '../repositories/user.repository';
import { EmailSignupDto, ProfileUpdateDto } from '../dtos/user.dto'; // 사용 중인 DTO만 남김
import { ValidationError, UnauthorizedError } from '../errors/errors'; // 필요한 에러 클래스만 남김
import { HashtagService } from '../services/hashtag.service.js';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';

export class UserService {
  private userRepository: UserRepository;
  private hashtagService: HashtagService; // ✅ 해시태그 서비스 추가

  constructor() {
    this.userRepository = new UserRepository();
    this.hashtagService = new HashtagService();
  }

  // 이메일 중복 확인
  async checkEmailDuplicate(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findUserByEmail(email);
    return !!existingUser;
  }

  async addUserHashtags(userId: number, hashtags: number[]) {
    const hashtagData = hashtags.map((hashtagId) => ({
      user_id: userId,
      hashtag_id: hashtagId,
    }));

    await this.userRepository.addUserHashtags(userId, hashtags);
  }

  // 이메일 회원가입 (해시태그 필수 선택)
  async emailSignup(data: EmailSignupDto) {
    if (
      !data.email ||
      !data.password ||
      !data.nickname ||
      !data.hashtags?.length
    ) {
      throw new ValidationError(
        '이메일, 비밀번호, 닉네임, 관심사는 필수 입력 항목입니다.',
        data
      );
    }

    // ✅ 해시태그 name → id 변환
    const hashtagNames = data.hashtags; // ["봄", "여름", "패션"]
    const hashtags = await this.hashtagService.findHashtagsByName(hashtagNames);

    if (hashtags.length !== hashtagNames.length) {
      throw new ValidationError('유효하지 않은 해시태그가 포함되어 있습니다.', {
        invalidHashtags: hashtagNames,
      });
    }

    // 변환된 해시태그 ID 리스트
    const hashtagIds = hashtags.map((tag) => tag.hashtag_id);

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 사용자 생성
    const user = await this.userRepository.createUser({
      ...data,
      password: hashedPassword,
      provider: 'local',
      providerId: data.email,
      status: 'ACTIVE',
    });

    // ✅ 관심사(해시태그) 저장
    await this.userRepository.addUserHashtags(user.user_id, hashtagIds);

    return user;
  }

  // 이메일 로그인
  async loginUser(email: string, password: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new ValidationError('이메일 또는 비밀번호가 잘못되었습니다.', null);
    }

    const isPasswordValid = await bcrypt.compare(
      password ?? '',
      user.password ?? ''
    );
    if (!isPasswordValid) {
      throw new ValidationError('이메일 또는 비밀번호가 잘못되었습니다.', null);
    }
    console.log(typeof user.user_id);
    const accessToken = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET || 'default_secret', // 기본값 추가, // ✅ 환경변수가 없으면 기본값 사용
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
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

  // ✅ 카카오 로그인 처리
  public async kakaoLogin(kakaoAccessToken?: string, code?: string) {
    try {
      // ✅ 1. `code`를 받은 경우, 카카오에서 `access_token` 요청
      if (!kakaoAccessToken && code) {
        console.log('🔹 Received Authorization Code:', code); // 디버깅

        const tokenResponse = await axios.post(
          'https://kauth.kakao.com/oauth/token',
          null,
          {
            params: {
              grant_type: 'authorization_code',
              client_id: process.env.KAKAO_CLIENT_ID,
              redirect_uri: 'https://www.hmaster.shop/oauth/kakao/callback',
              code,
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        kakaoAccessToken = tokenResponse.data.access_token;
        console.log('✅ Kakao Access Token:', kakaoAccessToken);
      }

      if (!kakaoAccessToken) {
        throw new Error('카카오 Access Token이 필요합니다.');
      }

      // ✅ 2. 카카오 사용자 정보 가져오기
      const kakaoUserInfo = await this.getKakaoUserInfo(kakaoAccessToken);

      // ✅ 3. DB에서 사용자 조회 또는 생성
      let user = await this.findOrCreateUserByKakaoId(kakaoUserInfo);

      // ✅ 4. JWT 토큰 발급
      const accessToken = this.generateAccessToken({
        userId: +user.user_id, // ✅ user_id를 id로 매핑
        email: user.email,
      });
      const refreshToken = this.generateRefreshToken({ userId: user.user_id });

      return { accessToken, refreshToken, user };
    } catch (error) {
      console.error('❌ 카카오 로그인 실패:', error.message);
      throw new Error('카카오 로그인 중 오류 발생');
    }
  }

  // ✅ 카카오 사용자 정보 가져오기
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
        id: data.id.toString(), // ✅ 유저 고유 ID (providerId)
        email: data.kakao_account?.email || null, // ✅ 이메일 없으면 null
        nickname: data.kakao_account?.profile.nickname || '사용자',
        profileImage: data.kakao_account?.profile.profile_image_url || null,
      };
    } catch (error) {
      console.error('❌ 카카오 사용자 정보 요청 실패:', error.message);
      throw new Error('카카오 사용자 정보를 가져오는 중 오류 발생');
    }
  }

  // ✅ DB에서 카카오 사용자 조회 또는 생성
  private async findOrCreateUserByKakaoId(kakaoUserInfo: {
    id: string;
    email: string | null;
    nickname: string;
    profileImage: string | null;
  }) {
    let user = await this.userRepository.findUserByProviderId(
      'kakao',
      kakaoUserInfo.id
    );

    if (!user) {
      // 신규 회원가입 처리
      user = await this.userRepository.createUser({
        provider: 'kakao',
        providerId: kakaoUserInfo.id,
        email: kakaoUserInfo.email || `${kakaoUserInfo.id}@kakao.com`, // ✅ 이메일이 없으면 가짜 이메일 사용
        nickname: kakaoUserInfo.nickname,
        profileImage: kakaoUserInfo.profileImage ?? '',
        status: 'ACTIVE',
      });
    }

    return user;
  }

  // 비밀번호 재설정 요청
  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new ValidationError('등록된 이메일이 없습니다.', email);
    }

    const resetToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_RESET_SECRET!,
      { expiresIn: '1h' }
    );

    // 개발 중에 토큰을 출력 (배포 환경에서는 제거해야 함)
    console.log(`Generated Reset Token: ${resetToken}`);

    // 이메일 발송 로직 (예: 외부 이메일 서비스 사용)
    await this.sendPasswordResetEmail(user.email ?? '', resetToken);

    return { message: '비밀번호 재설정 이메일이 발송되었습니다.' };
  }

  // 비밀번호 재설정
  async resetPassword(resetToken: string, newPassword: string) {
    try {
      const payload = jwt.verify(resetToken, process.env.JWT_RESET_SECRET!) as {
        userId: number;
      };

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.userRepository.updateUser(payload.userId, {
        password: hashedPassword,
      });

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
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'default_refresh_secret'
      ) as JwtPayload;

      if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
        throw new UnauthorizedError(
          '유효하지 않은 또는 만료된 Refresh Token입니다.',
          null
        );
      }

      const userId = decoded.userId as number; // ✅ userId가 존재하는지 확인 후 변환
      const user = await this.userRepository.findUserById(userId);

      if (!user) {
        throw new ValidationError('사용자를 찾을 수 없습니다.', null);
      }

      console.log(user.user_id, user.email);
      const accessToken = this.generateAccessToken({
        userId: user.user_id,
        email: user.email,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError(
        '유효하지 않은 또는 만료된 Refresh Token입니다.',
        null
      );
    }
  }

  private generateAccessToken(payload) {
    console.log(typeof payload.userId);
    return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', {
      expiresIn: '1h',
    });
  }

  private generateRefreshToken(payload: { userId: number }) {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      {
        expiresIn: '7d',
      }
    );
  }

  private async sendPasswordResetEmail(email: string, resetToken: string) {
    console.log(
      `Password reset email sent to ${email} with token: ${resetToken}`
    );
  }
}
