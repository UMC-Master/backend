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
    /**
     * @swagger
     * /api/v1/users/signup:
     *   post:
     *     summary: "이메일 회원가입"
     *     description: "이메일, 비밀번호, 닉네임을 통해 회원가입을 수행합니다."
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
     *                 example: "securePassword"
     *               nickname:
     *                 type: string
     *                 example: "TestUser"
     *               city:
     *                 type: string
     *                 example: "Seoul"
     *               district:
     *                 type: string
     *                 example: "Gangnam"
     *     responses:
     *       200:
     *         description: "회원가입 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isSuccess:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: string
     *                   example: "COMMON200"
     *                 message:
     *                   type: string
     *                   example: "회원가입이 완료되었습니다."
     *                 result:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 1
     *                     email:
     *                       type: string
     *                       example: "test@example.com"
     *                     nickname:
     *                       type: string
     *                       example: "TestUser"
     *       400:
     *         description: "잘못된 요청 데이터"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isSuccess:
     *                   type: boolean
     *                   example: false
     *                 code:
     *                   type: string
     *                   example: "INVALID_INPUT"
     *                 message:
     *                   type: string
     *                   example: "입력 데이터가 올바르지 않습니다."
     */
    this.router.post('/api/v1/users/signup', this.emailSignup.bind(this));
    /**
     * @swagger
     * /api/v1/users/signup/kakao:
     *   post:
     *     summary: "카카오 회원가입"
     *     description: "카카오 OAuth를 통한 회원가입을 수행합니다."
     *     tags:
     *       - Users
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               kakaoToken:
     *                 type: string
     *                 example: "kakao_access_token"
     *               email:
     *                 type: string
     *                 example: "kakao@example.com"
     *               nickname:
     *                 type: string
     *                 example: "KakaoUser"
     *               city:
     *                 type: string
     *                 example: "Seoul"
     *               district:
     *                 type: string
     *                 example: "Gangnam"
     *     responses:
     *       201:
     *         description: "카카오 회원가입 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   example: 2
     *                 email:
     *                   type: string
     *                   example: "kakao@example.com"
     *                 nickname:
     *                   type: string
     *                   example: "KakaoUser"
     *       400:
     *         description: "잘못된 요청 데이터"
     */
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