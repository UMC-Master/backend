import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { EmailSignupDto, KakaoSignupDto } from '../dtos/user.dto';

export class UserController {
  private userService: UserService;
  public router: Router;

  constructor() {
    this.userService = new UserService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/api/v1/users/signup', this.emailSignup.bind(this));
    this.router.post('/api/v1/users/signup/kakao', (req, res) => this.kakaoSignup(req, res));
  }

  private async emailSignup(req: Request, res: Response) {
    try {
      const userData = req.body;
      const user = await this.userService.emailSignup(userData);
      return res.success(user, '회원가입이 완료되었습니다.');
    } catch (error: any) {
      return res.error({
        errorCode: 'COMMON500',
        reason: '회원가입에 실패했습니다.',
        data: error.message,
      });
    }
  }
  

  private async kakaoSignup(req: Request, res: Response) {
    try {
      const data: KakaoSignupDto = req.body;
      const user = await this.userService.kakaoSignup(data);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}