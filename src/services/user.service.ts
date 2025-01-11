import { UserRepository } from '../repositories/user.repository';
import { EmailSignupDto, KakaoSignupDto } from '../dtos/user.dto';
import bcrypt from 'bcrypt';

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
}