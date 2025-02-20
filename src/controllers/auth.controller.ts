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
     * /api/v1/auth/send-verification-email:
     *   post:
     *     summary: 이메일 인증번호 요청
     *     description: 사용자가 이메일 인증번호를 요청하면 이메일로 전송합니다.
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
     *         description: 이메일 인증번호 전송 성공
     *       400:
     *         description: 잘못된 요청 또는 이메일 전송 실패
     */
    this.router.post(
      '/send-verification-email',
      this.sendVerificationEmail.bind(this)
    );

    /**
     * @swagger
     * /api/v1/auth/verify-email-code:
     *   post:
     *     summary: 이메일 인증번호 확인
     *     description: 사용자가 입력한 인증번호를 검증합니다.
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
     *               code:
     *                 type: string
     *                 example: "123456"
     *     responses:
     *       200:
     *         description: 인증 성공
     *       400:
     *         description: 인증 실패 또는 만료된 코드
     */
    this.router.post('/verify-email-code', this.verifyEmailCode.bind(this));
  }

  // ✅ 이메일 인증번호 요청 API
  async sendVerificationEmail(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: '이메일을 입력하세요.' });
    }

    try {
      await this.userService.sendVerificationEmail(email);
      return res.json({ message: '이메일 인증번호가 전송되었습니다.' });
    } catch (error) {
      return res
        .status(400)
        .json({ message: '이메일 전송 중 오류가 발생했습니다.' });
    }
  }

  // ✅ 이메일 인증번호 검증 API
  async verifyEmailCode(req: Request, res: Response) {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ message: '이메일과 인증번호를 입력하세요.' });
    }

    const result = await this.userService.verifyEmailCode(email, code);

    if (result.success) {
      return res.json({ message: result.message });
    } else {
      return res.status(400).json({ message: result.message });
    }
  }
}
