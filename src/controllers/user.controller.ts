import axios from 'axios';
import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import {
  EmailSignupDto,
  EmailLoginDto,
  KakaoLoginDto,
  ProfileUpdateDto,
} from '../dtos/user.dto';
import {
  ValidationError,
  UnauthorizedError,
  ResourceNotFoundError,
} from '../errors/errors.js';
import 'express-async-errors';

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
    this.router.delete(
      '/deactivate',
      authenticateJWT,
      this.deactivateAccount.bind(this)
    );
    this.router.post(
      '/reactivate',
      authenticateJWT,
      this.reactivateAccount.bind(this)
    );
    this.router.get(
      '/statistics',
      authenticateJWT,
      this.getStatistics.bind(this)
    );
    this.router.post('/token/refresh', this.refreshAccessToken.bind(this));
  }

  /**
   * @swagger
   * /signup:
   *   post:
   *     summary: 이메일 회원가입
   *     description: 이메일, 비밀번호, 닉네임으로 회원가입합니다.
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
   *       400:
   *         description: 잘못된 요청 데이터
   */
  public async emailSignup(req: Request, res: Response): Promise<void> {
    const data: EmailSignupDto = req.body;
    if (!data.email || !data.password || !data.nickname) {
      throw new ValidationError(
        '이메일, 비밀번호, 닉네임은 필수 입력 항목입니다.',
        data
      );
    }
    const user = await this.userService.emailSignup(data);
    res
      .status(201)
      .json({ isSuccess: true, message: '회원가입 성공', result: user });
  }

  /**
   * @swagger
   * /login:
   *   post:
   *     summary: 이메일 로그인
   *     description: 이메일과 비밀번호를 사용하여 로그인합니다.
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
   *       400:
   *         description: 잘못된 요청 데이터
   */
  public async emailLogin(req: Request, res: Response): Promise<void> {
    const { email, password }: EmailLoginDto = req.body;
    if (!email || !password) {
      throw new ValidationError(
        '이메일과 비밀번호는 필수 입력 항목입니다.',
        null
      );
    }
    const tokens = await this.userService.loginUser(email, password);
    res
      .status(200)
      .json({ isSuccess: true, message: '로그인 성공', result: tokens });
  }

  /**
   * @swagger
   * /login/kakao:
   *   post:
   *     summary: 카카오 로그인
   *     description: 카카오 액세스 토큰을 사용하여 로그인합니다.
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/KakaoLoginDto'
   *     responses:
   *       200:
   *         description: 로그인 성공
   *       400:
   *         description: 잘못된 요청 데이터
   */
  public async kakaoLogin(req: Request, res: Response): Promise<void> {
    const { kakaoAccessToken }: KakaoLoginDto = req.body;
    if (!kakaoAccessToken) {
      res
        .status(400)
        .json({
          isSuccess: false,
          message: '카카오 Access Token이 필요합니다.',
        });
      return;
    }

    try {
      const tokens = await this.userService.kakaoLogin(kakaoAccessToken);
      res
        .status(200)
        .json({
          isSuccess: true,
          message: '카카오 로그인 성공',
          result: tokens,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          isSuccess: false,
          message: '카카오 로그인 실패',
          error: error.message,
        });
    }
  }

  /**
   * @swagger
   * /profile:
   *   get:
   *     summary: 사용자 프로필 조회
   *     description: 현재 로그인된 사용자의 프로필 정보를 조회합니다.
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
  public async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError('로그인이 필요합니다.', null);
    const profile = await this.userService.getProfile(userId);
    if (!profile)
      throw new ResourceNotFoundError('사용자 프로필을 찾을 수 없습니다.', {
        userId,
      });
    res
      .status(200)
      .json({ isSuccess: true, message: '프로필 조회 성공', result: profile });
  }

  /**
   * @swagger
   * /profile:
   *   put:
   *     summary: 사용자 프로필 수정
   *     description: 현재 로그인된 사용자의 프로필 정보를 수정합니다.
   *     tags:
   *       - Users
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ProfileUpdateDto'
   *     responses:
   *       200:
   *         description: 프로필 수정 성공
   *       401:
   *         description: 인증 실패
   */
  public async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const data: ProfileUpdateDto = req.body;
    const updatedProfile = await this.userService.updateProfile(userId, data);
    res
      .status(200)
      .json({
        isSuccess: true,
        message: '프로필 수정 성공',
        result: updatedProfile,
      });
  }

  /**
   * @swagger
   * /password/reset:
   *   post:
   *     summary: 비밀번호 재설정 요청
   *     description: 이메일을 통해 비밀번호 재설정을 요청합니다.
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 description: 사용자 이메일
   *     responses:
   *       200:
   *         description: 비밀번호 재설정 요청 성공
   *       400:
   *         description: 잘못된 요청 데이터
   */
  public async requestPasswordReset(
    req: Request,
    res: Response
  ): Promise<void> {
    const { email } = req.body;
    const result = await this.userService.requestPasswordReset(email);
    res.status(200).json({ isSuccess: true, message: result.message });
  }

  /**
   * @swagger
   * /password/reset/confirm:
   *   post:
   *     summary: 비밀번호 재설정 확인
   *     description: 토큰과 새 비밀번호를 사용하여 비밀번호를 재설정합니다.
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               resetToken:
   *                 type: string
   *                 description: 비밀번호 재설정 토큰
   *               newPassword:
   *                 type: string
   *                 description: 새 비밀번호
   *     responses:
   *       200:
   *         description: 비밀번호 재설정 성공
   *       400:
   *         description: 잘못된 요청 데이터
   */
  public async resetPassword(req: Request, res: Response): Promise<void> {
    const { resetToken, newPassword } = req.body;
    const result = await this.userService.resetPassword(
      resetToken,
      newPassword
    );
    res.status(200).json({ isSuccess: true, message: result.message });
  }

  /**
   * @swagger
   * /deactivate:
   *   delete:
   *     summary: 계정 비활성화
   *     description: 현재 로그인된 사용자의 계정을 비활성화합니다.
   *     tags:
   *       - Users
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 계정 비활성화 성공
   *       401:
   *         description: 인증 실패
   */
  public async deactivateAccount(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const result = await this.userService.deactivateAccount(userId);
    res.status(200).json({ isSuccess: true, message: result.message });
  }

  /**
   * @swagger
   * /reactivate:
   *   post:
   *     summary: 계정 활성화
   *     description: 비활성화된 계정을 다시 활성화합니다.
   *     tags:
   *       - Users
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 계정 활성화 성공
   *       401:
   *         description: 인증 실패
   */
  public async reactivateAccount(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const result = await this.userService.reactivateAccount(userId);
    res.status(200).json({ isSuccess: true, message: result.message });
  }

  /**
   * @swagger
   * /statistics:
   *   get:
   *     summary: 사용자 통계 조회
   *     description: 현재 로그인된 사용자의 통계 정보를 조회합니다.
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
  public async getStatistics(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const statistics = await this.userService.getStatistics(userId);
    res
      .status(200)
      .json({ isSuccess: true, message: '통계 조회 성공', result: statistics });
  }

  /**
   * @swagger
   * /token/refresh:
   *   post:
   *     summary: Access Token 갱신
   *     description: Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 description: 유효한 Refresh Token
   *     responses:
   *       200:
   *         description: 토큰 갱신 성공
   *       400:
   *         description: 잘못된 요청 데이터
   */
  public async refreshAccessToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    const result = await this.userService.refreshAccessToken(refreshToken);
    res
      .status(200)
      .json({ isSuccess: true, message: 'Access Token 갱신 성공', result });
  }
}
