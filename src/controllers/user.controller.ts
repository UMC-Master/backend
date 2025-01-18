import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { KakaoSignupDto, EmailSignupDto, EmailLoginDto, ProfileUpdateDto } from '../dtos/user.dto';

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
    this.router.post('/api/v1/users/signup/kakao', this.kakaoSignup.bind(this));
    this.router.post('/api/v1/users/login', this.emailLogin.bind(this));
    this.router.post('/api/v1/users/login/kakao', this.kakaoLogin.bind(this));
    this.router.get('/api/v1/users/profile', authenticateJWT, this.getProfile.bind(this));
    this.router.put('/api/v1/users/profile', authenticateJWT, this.updateProfile.bind(this));
    this.router.get('/api/v1/users/statistics', authenticateJWT, this.getStatistics.bind(this));
  }

  /**
   * @swagger
   * /api/v1/users/signup:
   *   post:
   *     summary: 이메일 회원가입
   *     description: 이메일, 비밀번호, 닉네임, 주소 정보를 입력해 회원가입을 수행합니다.
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EmailSignupDto'
   *     responses:
   *       201:
   *         description: 회원가입 성공
   *       500:
   *         description: 회원가입 실패
   */
  private async emailSignup(req: Request, res: Response): Promise<void> {
    try {
      const data: EmailSignupDto = req.body;
      const user = await this.userService.emailSignup(data);
      res.status(201).json({
        isSuccess: true,
        code: 'COMMON201',
        message: '회원가입이 완료되었습니다.',
        result: user,
      });
    } catch (error: unknown) {
      res.status(500).json({
        isSuccess: false,
        code: 'COMMON500',
        message: '회원가입에 실패했습니다.',
        result: (error as Error).message,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/users/signup/kakao:
   *   post:
   *     summary: 카카오 회원가입
   *     description: 카카오 OAuth 인증 후 추가 정보를 입력하여 회원가입을 수행합니다.
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/KakaoSignupDto'
   *     responses:
   *       201:
   *         description: 회원가입 성공
   *       500:
   *         description: 회원가입 실패
   */
  private async kakaoSignup(req: Request, res: Response): Promise<void> {
    try {
      const data: KakaoSignupDto = req.body;
      const user = await this.userService.kakaoSignup(data);
      res.status(201).json({
        isSuccess: true,
        code: 'COMMON201',
        message: '카카오 회원가입이 완료되었습니다.',
        result: user,
      });
    } catch (error: unknown) {
      res.status(500).json({
        isSuccess: false,
        code: 'COMMON500',
        message: '카카오 회원가입에 실패했습니다.',
        result: (error as Error).message,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/users/login:
   *   post:
   *     summary: 이메일 로그인
   *     description: 이메일과 비밀번호를 통해 사용자가 로그인합니다.
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EmailLoginDto'
   *     responses:
   *       200:
   *         description: 로그인 성공
   *       401:
   *         description: 로그인 실패
   */
  private async emailLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: EmailLoginDto = req.body;
      const tokens = await this.userService.loginUser(email, password);
      res.status(200).json({
        isSuccess: true,
        code: 'AUTH200',
        message: '로그인에 성공했습니다.',
        result: tokens,
      });
    } catch (error: unknown) {
      res.status(401).json({
        isSuccess: false,
        code: 'AUTH401',
        message: '로그인에 실패했습니다.',
        result: (error as Error).message,
      });
    }
  }

  private async kakaoLogin(req: Request, res: Response): Promise<void> {
    try {
      // TODO: 카카오 인증 로직 추가
      res.status(200).json({ message: '카카오 로그인 성공 (로직 추가 필요)' });
    } catch (error: unknown) {
      res.status(401).json({
        isSuccess: false,
        code: 'AUTH401',
        message: '카카오 로그인에 실패했습니다.',
        result: (error as Error).message,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/users/profile:
   *   get:
   *     summary: 사용자 프로필 조회
   *     description: 인증된 사용자의 프로필 정보를 반환합니다.
   *     tags:
   *       - Users
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 프로필 조회 성공
   *       401:
   *         description: 인증 실패
   */
  private async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const profile = await this.userService.getProfile(userId);
      res.status(200).json(profile);
    } catch (error: unknown) {
      res.status(500).json({ message: '프로필 조회 실패', error: (error as Error).message });
    }
  }

  private async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const data: ProfileUpdateDto = req.body; // ProfileUpdateDto 사용
      const updatedProfile = await this.userService.updateProfile(userId, data);
      res.status(200).json({
        isSuccess: true,
        message: '사용자 정보가 성공적으로 수정되었습니다.',
        result: updatedProfile,
      });
    } catch (error: unknown) {
      res.status(400).json({ message: '프로필 수정 실패', error: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /api/v1/users/statistics:
   *   get:
   *     summary: 사용자 통계 조회
   *     description: 사용자의 활동 통계(퀴즈 점수, 좋아요 수 등)를 반환합니다.
   *     tags:
   *       - Users
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 통계 조회 성공
   *       401:
   *         description: 인증 실패
   */
  private async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const statistics = await this.userService.getStatistics(userId);
      res.status(200).json(statistics);
    } catch (error: unknown) {
      res.status(500).json({ message: '통계 조회 실패', error: (error as Error).message });
    }
  }
}