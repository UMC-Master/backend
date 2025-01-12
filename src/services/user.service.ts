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
    });
    return user;
  }

  async kakaoSignup(data: KakaoSignupDto) {
    // OAuth 인증 로직 생략
    const user = await this.userRepository.createUser({
      ...data,
      login_type: 'KAKAO',
    });
    return user;
  }

  async loginUser(email: string, password: string) {
    // 1. 사용자 확인
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 2. 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 마지막 로그인 시간 업데이트
    await this.userRepository.updateLastLogin(user.user_id, new Date());

    // 3. JWT 생성
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