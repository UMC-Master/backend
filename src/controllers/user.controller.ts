import axios from 'axios';
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken'; // JWT 토큰 발급
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

const KAKAO_USER_INFO_URL = 'https://kapi.kakao.com/v2/user/me';
const JWT_SECRET = process.env.JWT_SECRET;

export class UserController {
  private userService: UserService;
  public router: Router;

  constructor() {
    this.userService = new UserService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/check-email', this.checkEmailDuplicate.bind(this));
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
   * /api/v1/check-email:
   *   post:
   *     summary: 이메일 중복 확인
   *     description: 입력한 이메일이 이미 등록되어 있는지 확인합니다.
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
   *                 example: "test@example.com"
   *     responses:
   *       200:
   *         description: 사용 가능한 이메일
   *       400:
   *         description: 이미 사용 중인 이메일
   */
  public async checkEmailDuplicate(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const isDuplicate = await this.userService.checkEmailDuplicate(email);

    if (isDuplicate) {
      res.status(400).json({
        isSuccess: false,
        message: '이미 사용 중인 이메일입니다.',
      });
      return;
    }

    res.status(200).json({
      isSuccess: true,
      message: '사용 가능한 이메일입니다.',
    });
  }

  /**
   * @swagger
   * /api/v1/signup:
   *   post:
   *     summary: 이메일 회원가입
   *     description: 이메일, 비밀번호, 닉네임으로 회원가입하며, 관심사(해시태그) 선택이 필수입니다.
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
   *                 example: "test@example.com"
   *               password:
   *                 type: string
   *                 example: "password123@!"
   *               nickname:
   *                 type: string
   *                 example: "testuser"
   *               hashtags:
   *                 type: array
   *                 items:
   *                   type: integer
   *                 example: ["봄", "여름", "패션"]
   *     responses:
   *       201:
   *         description: 회원가입 성공
   *       400:
   *         description: 잘못된 요청 데이터
   */
  public async emailSignup(req: Request, res: Response): Promise<void> {
    const data: EmailSignupDto = req.body;

    if (!data.email || !data.password || !data.nickname || !data.hashtags) {
      throw new ValidationError(
        '이메일, 비밀번호, 닉네임, 관심사는 필수 입력 항목입니다.',
        data
      );
    }

    const user = await this.userService.emailSignup(data);
    res.status(201).json({
      isSuccess: true,
      message: '회원가입 성공',
      result: user,
    });
  }

  /**
   * @swagger
   * /api/v1/login:
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
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: "test@example.com"
   *                 description: 로그인 이메일
   *               password:
   *                 type: string
   *                 example: "password123"
   *                 description: 계정 비밀번호
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
   * /api/v1/login/kakao:
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
   *             type: object
   *             properties:
   *               kakaoAccessToken:
   *                 type: string
   *                 description: 카카오 발급 액세스 토큰
   *     responses:
   *       200:
   *         description: 로그인 성공
   *       400:
   *         description: 잘못된 요청 데이터
   */
  // ✅ 카카오 로그인 요청 처리
  public async kakaoLogin(req: Request, res: Response): Promise<void> {
    const { kakaoAccessToken }: KakaoLoginDto = req.body;

    if (!kakaoAccessToken) {
      res.status(400).json({
        isSuccess: false,
        message: '카카오 Access Token이 필요합니다.',
      });
      return;
    }

    try {
      // ✅ UserService의 kakaoLogin 메서드 호출
      const { accessToken, refreshToken, user } =
        await this.userService.kakaoLogin(kakaoAccessToken);

      // ✅ 응답 반환
      res.status(200).json({
        isSuccess: true,
        message: '카카오 로그인 성공',
        result: {
          user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('❌ 카카오 로그인 실패:', error.message);
      res.status(500).json({
        isSuccess: false,
        message: '카카오 로그인 실패',
        error: error.message,
      });
    }
  }

  /**
   * @swagger
   * /api/v1/profile:
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
   * /api/v1/profile:
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
   *             type: object
   *             properties:
   *               nickname:
   *                 type: string
   *                 example: "newNickname"
   *                 description: 새로운 닉네임
   *               city:
   *                 type: string
   *                 example: "newCity"
   *                 description: 새로운 도시 정보
   *               district:
   *                 type: string
   *                 example: "newDistrict"
   *                 description: 새로운 구 정보
   *     responses:
   *       200:
   *         description: 프로필 수정 성공
   *       401:
   *         description: 인증 실패
   */
  public async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (userId === undefined) {
        throw new UnauthorizedError('로그인이 필요합니다.', null);
      }

      const data: ProfileUpdateDto = req.body;
      const updatedProfile = await this.userService.updateProfile(userId, data);

      res.status(200).json({
        isSuccess: true,
        message: '프로필 수정 성공',
        result: updatedProfile,
      });
    } catch (error) {
      res.status(error instanceof ValidationError ? 400 : 500).json({
        isSuccess: false,
        message:
          error instanceof Error ? error.message : '프로필 수정 중 오류 발생',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/password/reset:
   *   post:
   *     summary: 비밀번호 재설정 요청
   *     description: 사용자가 이메일을 입력하면 비밀번호 재설정 링크를 전송합니다.
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
   *                 example: "test@example.com"
   *                 description: 비밀번호 재설정을 요청할 이메일 주소
   *     responses:
   *       200:
   *         description: 비밀번호 재설정 요청 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 isSuccess:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "비밀번호 재설정 이메일이 발송되었습니다."
   *       400:
   *         description: 잘못된 요청 데이터
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 isSuccess:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "올바른 이메일 주소를 입력해주세요."
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
   * /api/v1/password/reset/confirm:
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
   *                 example: "abcdef123456"
   *                 description: 비밀번호 재설정 토큰
   *               newPassword:
   *                 type: string
   *                 example: "newStrongPassword"
   *                 description: 새로운 비밀번호
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
   * /api/v1/deactivate:
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
    try {
      const userId = req.user?.userId;

      if (userId === undefined) {
        throw new UnauthorizedError('로그인이 필요합니다.', null);
      }

      const result = await this.userService.deactivateAccount(userId);

      res.status(200).json({
        isSuccess: true,
        message: result.message,
      });
    } catch (error) {
      res.status(error instanceof ValidationError ? 400 : 500).json({
        isSuccess: false,
        message:
          error instanceof Error ? error.message : '계정 비활성화 중 오류 발생',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/reactivate:
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
    try {
      const userId = req.user?.userId;

      if (userId === undefined) {
        throw new UnauthorizedError('로그인이 필요합니다.', null);
      }

      const result = await this.userService.reactivateAccount(userId);

      res.status(200).json({
        isSuccess: true,
        message: result.message,
      });
    } catch (error) {
      res.status(error instanceof ValidationError ? 400 : 500).json({
        isSuccess: false,
        message:
          error instanceof Error ? error.message : '계정 활성화 중 오류 발생',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/statistics:
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
    try {
      const userId = req.user?.userId;

      if (userId === undefined) {
        throw new UnauthorizedError('로그인이 필요합니다.', null);
      }

      const statistics = await this.userService.getStatistics(userId);

      res.status(200).json({
        isSuccess: true,
        message: '통계 조회 성공',
        result: statistics,
      });
    } catch (error) {
      res.status(500).json({
        isSuccess: false,
        message:
          error instanceof Error ? error.message : '통계 조회 중 오류 발생',
      });
    }
  }

  /**
   * @swagger
   * /api/v1/token/refresh:
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
