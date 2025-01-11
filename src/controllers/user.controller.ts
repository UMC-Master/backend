import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { KakaoSignupDto } from '../dtos/user.dto';

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
 *     description: "사용자가 이메일, 비밀번호, 닉네임, 주소(시, 구)를 통해 회원가입을 수행합니다."
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
 *       201:
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
 *                   example: "COMMON201"
 *                 message:
 *                   type: string
 *                   example: "회원가입이 완료되었습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "test@example.com"
 *                     nickname:
 *                       type: string
 *                       example: "TestUser"
 *                     city:
 *                       type: string
 *                       example: "Seoul"
 *                     district:
 *                       type: string
 *                       example: "Gangnam"
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
 *                   example: "요청 데이터가 유효하지 않습니다."
 */
    this.router.post('/api/v1/users/signup', this.emailSignup.bind(this));

    /**
 * @swagger
 * /api/v1/users/signup/kakao:
 *   post:
 *     summary: "소셜 계정 회원가입 (카카오톡)"
 *     description: "카카오 OAuth 인증 후 추가 정보를 입력하여 회원가입을 수행합니다."
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
 *                 example: "user@kakao.com"
 *               nickname:
 *                 type: string
 *                 example: "KakaoUser123"
 *               city:
 *                 type: string
 *                 example: "Seoul"
 *               district:
 *                 type: string
 *                 example: "Gangnam"
 *     responses:
 *       201:
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
 *                   example: "COMMON201"
 *                 message:
 *                   type: string
 *                   example: "카카오 회원가입이 완료되었습니다."
 *                 result:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 2
 *                     email:
 *                       type: string
 *                       example: "user@kakao.com"
 *                     nickname:
 *                       type: string
 *                       example: "KakaoUser123"
 *                     city:
 *                       type: string
 *                       example: "Seoul"
 *                     district:
 *                       type: string
 *                       example: "Gangnam"
 *       401:
 *         description: "OAuth 인증 실패"
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
 *                   example: "OAUTH_ERROR"
 *                 message:
 *                   type: string
 *                   example: "카카오 인증 실패"
 */
    this.router.post('/api/v1/users/signup/kakao', (req, res) => this.kakaoSignup(req, res));

    /**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: "이메일 로그인"
 *     description: "이메일과 비밀번호를 사용하여 사용자가 로그인합니다."
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
 *                 description: "사용자의 이메일 주소"
 *               password:
 *                 type: string
 *                 example: "securePassword"
 *                 description: "사용자의 비밀번호"
 *     responses:
 *       200:
 *         description: "로그인 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "jwt_access_token"
 *                 refreshToken:
 *                   type: string
 *                   example: "jwt_refresh_token"
 *       401:
 *         description: "로그인 실패"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
    this.router.post('/api/v1/users/login', (req: Request, res: Response) => {
      res.json({});
    });

    /**
* @swagger
* /api/v1/users/login/kakao:
*   post:
*     summary: "소셜 계정 로그인 (카카오톡)"
*     description: "카카오 OAuth 인증을 통해 사용자가 로그인합니다."
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
*                 description: "카카오 OAuth 액세스 토큰"
*     responses:
*       200:
*         description: "로그인 성공"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 accessToken:
*                   type: string
*                   example: "jwt_access_token"
*                 refreshToken:
*                   type: string
*                   example: "jwt_refresh_token"
*       401:
*         description: "OAuth 인증 실패"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: "카카오 인증 실패"
*/
    this.router.post('/api/v1/users/login/kakao', (req: Request, res: Response) => {
      res.json({});
    });

    /**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: "사용자 정보 수정"
 *     description: "이메일, 닉네임, 비밀번호 및 주소 정보를 수정합니다."
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
 *                 example: "updated_email@example.com"
 *               password:
 *                 type: string
 *                 example: "newSecurePassword123"
 *               nickname:
 *                 type: string
 *                 example: "NewNickname"
 *               city:
 *                 type: string
 *                 example: "Seoul"
 *               district:
 *                 type: string
 *                 example: "Gangnam"
 *     responses:
 *       200:
 *         description: "사용자 정보 수정 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "사용자 정보가 성공적으로 수정되었습니다."
 *       400:
 *         description: "잘못된 요청 데이터"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "요청 데이터가 유효하지 않습니다."
 */
    this.router.put('/api/v1/users/profile', (req: Request, res: Response) => {
      res.json({});
    });

    /**
* @swagger
* /api/v1/users/profile/image:
*   post:
*     summary: "프로필 이미지 업로드"
*     description: "사용자의 프로필 이미지를 업로드합니다."
*     tags:
*       - Users
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             type: object
*             properties:
*               image:
*                 type: string
*                 format: binary
*     responses:
*       200:
*         description: "프로필 이미지 업로드 성공"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: "프로필 이미지가 성공적으로 업로드되었습니다."
*       400:
*         description: "이미지 업로드 실패"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: "유효하지 않은 이미지 파일입니다."
*/
    this.router.post('/api/v1/users/profile/image', (req: Request, res: Response) => {
      res.json({});
    });

    /**
* @swagger
* /api/v1/users/notifications:
*   put:
*     summary: "알림 설정 관리"
*     description: "사용자의 알림 설정 정보를 업데이트합니다."
*     tags:
*       - Users
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               notifications:
*                 type: array
*                 items:
*                   type: string
*                 example: ["LIKE", "COMMENT"]
*                 description: "활성화할 알림 타입 목록"
*     responses:
*       200:
*         description: "알림 설정 업데이트 성공"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: "알림 설정이 성공적으로 업데이트되었습니다."
*       400:
*         description: "잘못된 요청 데이터"
*/
    this.router.put('/api/v1/users/notifications', (req: Request, res: Response) => {
      res.json({});
    });

    /**
* @swagger
* /api/v1/users/statistics:
*   get:
*     summary: "사용자 활동 통계 조회"
*     description: "사용자의 퀴즈 성적, 꿀팁 공유 수 등 활동 통계를 제공합니다."
*     tags:
*       - Users
*     responses:
*       200:
*         description: "사용자 활동 통계 조회 성공"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 quiz_score:
*                   type: integer
*                   example: 85
*                   description: "사용자의 퀴즈 점수"
*                 tips_shared_count:
*                   type: integer
*                   example: 12
*                   description: "사용자가 공유한 꿀팁 수"
*                 likes_received:
*                   type: integer
*                   example: 45
*                   description: "사용자가 받은 좋아요 수"
*       400:
*         description: "통계 조회 실패"
*/
    this.router.get('/api/v1/users/statistics', (req: Request, res: Response) => {
      res.json({});
    });
  }

  private async emailSignup(req: Request, res: Response) {
    try {
      const userData = req.body;
      const user = await this.userService.emailSignup(userData);
      return res.success(user, '회원가입이 완료되었습니다.');
    } catch (error) {
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