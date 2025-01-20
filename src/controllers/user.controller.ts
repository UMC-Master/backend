import axios from 'axios';
import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { EmailSignupDto, EmailLoginDto, KakaoLoginDto, ProfileUpdateDto } from '../dtos/user.dto';
import { ValidationError, UnauthorizedError, ResourceNotFoundError } from '../errors';

export class UserController {
  private userService: UserService;
  public router: Router;

  constructor() {
    this.userService = new UserService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/signup', this.emailSignup.bind(this));
    this.router.post('/login', this.emailLogin.bind(this));
    this.router.post('/login/kakao', this.kakaoLogin.bind(this));
    this.router.get('/profile', authenticateJWT, this.getProfile.bind(this));
    this.router.put('/profile', authenticateJWT, this.updateProfile.bind(this));
    this.router.post('/password/reset', this.requestPasswordReset.bind(this));
    this.router.post('/password/reset/confirm', this.resetPassword.bind(this));
    this.router.delete('/deactivate', authenticateJWT, this.deactivateAccount.bind(this));
    this.router.post('/reactivate', authenticateJWT, this.reactivateAccount.bind(this));
    this.router.get('/statistics', authenticateJWT, this.getStatistics.bind(this));
    this.router.post('/token/refresh', this.refreshAccessToken.bind(this));
  }

  // 공통 검증 유틸리티
  private validateFields(fields: Record<string, any>, message: string) {
    const missingFields = Object.entries(fields).filter(([, value]) => !value);
    if (missingFields.length > 0) {
      throw new ValidationError(message, fields);
    }
  }

  private async emailSignup(req: Request, res: Response): Promise<void> {
    const data: EmailSignupDto = req.body;
    this.validateFields(data, '이메일, 비밀번호, 닉네임은 필수 입력 항목입니다.');
    const user = await this.userService.emailSignup(data);
    res.status(201).json({ isSuccess: true, message: '회원가입 성공', result: user });
  }

  private async emailLogin(req: Request, res: Response): Promise<void> {
    const { email, password }: EmailLoginDto = req.body;
    this.validateFields({ email, password }, '이메일과 비밀번호는 필수 입력 항목입니다.');
    const tokens = await this.userService.loginUser(email, password);
    res.status(200).json({ isSuccess: true, message: '로그인 성공', result: tokens });
  }

  private async kakaoLogin(req: Request, res: Response): Promise<void> {
    const { kakaoAccessToken }: KakaoLoginDto = req.body;


    if (!kakaoAccessToken) {
      res.status(400).json({ isSuccess: false, message: '카카오 Access Token이 필요합니다.' });
      return;
    }

    try {
      const tokens = await this.userService.kakaoLogin(kakaoAccessToken);
      res.status(200).json({ isSuccess: true, message: '카카오 로그인 성공', result: tokens });
    } catch (error) {
      res.status(500).json({ isSuccess: false, message: '카카오 로그인 실패', error: error.message });
    }
  }

  private async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError('로그인이 필요합니다.', null);
    const profile = await this.userService.getProfile(userId);
    if (!profile) throw new ResourceNotFoundError('사용자 프로필을 찾을 수 없습니다.', { userId });
    res.status(200).json({ isSuccess: true, message: '프로필 조회 성공', result: profile });
  }

  private async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError('로그인이 필요합니다.', null);
    const data: ProfileUpdateDto = req.body;
    this.validateFields(data, '업데이트할 데이터가 필요합니다.');
    const updatedProfile = await this.userService.updateProfile(userId, data);
    res.status(200).json({ isSuccess: true, message: '프로필 수정 성공', result: updatedProfile });
  }

  private async requestPasswordReset(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    this.validateFields({ email }, '이메일은 필수 입력 항목입니다.');
    const result = await this.userService.requestPasswordReset(email);
    res.status(200).json({ isSuccess: true, message: result.message });
  }

  private async resetPassword(req: Request, res: Response): Promise<void> {
    const { resetToken, newPassword } = req.body;
    this.validateFields({ resetToken, newPassword }, '토큰과 새 비밀번호는 필수 입력 항목입니다.');
    const result = await this.userService.resetPassword(resetToken, newPassword);
    res.status(200).json({ isSuccess: true, message: result.message });
  }

  private async deactivateAccount(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError('로그인이 필요합니다.', null);
    const result = await this.userService.deactivateAccount(userId);
    res.status(200).json({ isSuccess: true, message: result.message });
  }

  private async reactivateAccount(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId; // JWT로 인증된 사용자 ID
    if (!userId) {
      throw new UnauthorizedError('로그인이 필요합니다.', null);
    }
  
    const result = await this.userService.reactivateAccount(userId);
    res.status(200).json({ isSuccess: true, message: result.message });
  }
  

  private async getStatistics(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError('로그인이 필요합니다.', null);
    const statistics = await this.userService.getStatistics(userId);
    res.status(200).json({ isSuccess: true, message: '통계 조회 성공', result: statistics });
  }

  private async refreshAccessToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    this.validateFields({ refreshToken }, 'Refresh Token이 필요합니다.');
    const result = await this.userService.refreshAccessToken(refreshToken);
    res.status(200).json({ isSuccess: true, message: 'Access Token 갱신 성공', result });
  }
}