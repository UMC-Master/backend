import express, { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';

export class AuthController {
  private userService: UserService;
  public router = express.Router(); // ✅ 라우터 생성

  constructor() {
    this.userService = new UserService();
    this.initializeRoutes(); // ✅ 라우트 초기화
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /api/v1/auth/verify-email:
     *   get:
     *     summary: 이메일 인증 확인
     *     description: 사용자가 이메일 인증 링크를 클릭하면 이메일을 인증합니다.
     *     tags:
     *       - Authentication
     *     parameters:
     *       - name: token
     *         in: query
     *         required: true
     *         description: 이메일 인증 토큰
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: 이메일 인증 성공
     *       400:
     *         description: 잘못된 요청 또는 유효하지 않은 토큰
     */
    this.router.get('/verify-email', this.verifyEmail.bind(this));

    /**
     * @swagger
     * /api/v1/auth/send-verification-email:
     *   post:
     *     summary: 이메일 인증 요청
     *     description: 사용자가 이메일 인증을 요청하면 인증 링크를 전송합니다.
     *     tags:
     *       - Authentication
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 example: "user@example.com"
     *     responses:
     *       200:
     *         description: 이메일 인증 링크 전송 성공
     *       400:
     *         description: 잘못된 요청 또는 이메일 전송 실패
     */
    this.router.post(
      '/send-verification-email',
      this.sendVerificationEmail.bind(this)
    );
  }

  // ✅ 이메일 인증 확인 API
  async verifyEmail(req: Request, res: Response) {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: '토큰이 없습니다.' });
    }

    try {
      // ✅ 토큰 검증
      const decoded = jwt.verify(
        token as string,
        process.env.JWT_EMAIL_SECRET!
      ) as { email: string };

      // ✅ DB에서 해당 토큰이 존재하는지 확인
      const verification =
        await this.userService.userRepository.findEmailVerificationToken(
          token as string
        );

      if (!verification) {
        return res.status(400).json({ message: '유효하지 않은 토큰입니다.' });
      }

      // ✅ 이메일 인증 완료 후 토큰 삭제
      await this.userService.userRepository.deleteEmailVerificationToken(
        decoded.email
      );

      return res.json({ message: '이메일 인증이 완료되었습니다.' });
    } catch (error) {
      return res
        .status(400)
        .json({ message: '유효하지 않은 또는 만료된 토큰입니다.' });
    }
  }

  // ✅ 이메일 인증 요청 API
  async sendVerificationEmail(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: '이메일을 입력하세요.' });
    }

    try {
      await this.userService.sendVerificationEmail(email);
      return res.json({ message: '이메일 인증 링크가 전송되었습니다.' });
    } catch (error) {
      return res
        .status(400)
        .json({ message: '이메일 전송 중 오류가 발생했습니다.' });
    }
  }
}
