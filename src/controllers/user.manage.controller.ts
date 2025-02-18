import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import 'express-async-errors';
import { UserService } from '../services/user.service.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { NotAdminError } from '../errors/user.error.js';

export class UserManageController {
  private userService: UserService; // 이후 UserManageService로 설정
  public router: Router;

  constructor() {
    this.userService = new UserService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /api/v1/manage/users/{userId}/status:
     *   put:
     *     summary: "사용자 상태 변경"
     *     description: "특정 사용자의 상태를 업데이트합니다."
     *     tags:
     *       - User Management
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         description: "상태를 변경할 사용자의 고유 ID"
     *         schema:
     *           type: integer
     *           example: 123
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               status:
     *                 type: string
     *                 description: "사용자의 새 상태 (예: active, inactive, suspended 등)"
     *     responses:
     *       200:
     *         description: "사용자의 상태가 성공적으로 변경되었습니다."
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user_id:
     *                   type: integer
     *                   example: 123
     *                   description: "상태가 변경된 사용자의 고유 ID"
     *                 status:
     *                   type: string
     *                   example: "active"
     *                   description: "사용자의 새로운 상태"
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.put('/manage/users/:userId', this.manageUser.bind(this));

    /**
     * @swagger
     * /api/v1/monitor/users/{userId}:
     *   get:
     *     summary: "사용자 로그 조회"
     *     description: "특정 사용자의 활동 로그를 조회합니다."
     *     tags:
     *       - User Management
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         description: "활동 로그를 조회할 사용자의 고유 ID"
     *         schema:
     *           type: integer
     *           example: 123
     *     responses:
     *       200:
     *         description: "사용자의 활동 로그 조회 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 userId:
     *                   type: integer
     *                   example: 123
     *                   description: "활동 로그가 조회된 사용자의 고유 ID"
     *                 logs:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       logId:
     *                         type: integer
     *                         example: 1
     *                         description: "로그 항목의 고유 ID"
     *                       action:
     *                         type: string
     *                         example: "로그인"
     *                         description: "사용자가 수행한 작업"
     *                       timestamp:
     *                         type: string
     *                         format: date-time
     *                         example: "2025-01-12T10:00:00Z"
     *                         description: "로그가 기록된 시간"
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.get('/monitor/users/:userId', this.monitorUser.bind(this));

    /**
     * @swagger
     * /api/v1/users/{userId}/influencer:
     *   patch:
     *     summary: "유저 인플루언서 설정"
     *     description: "관리자가 특정 유저를 인플루언서로 설정합니다."
     *     tags:
     *       - User
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         description: "인플루언서로 설정할 유저의 ID"
     *         schema:
     *           type: integer
     *           example: 123
     *     responses:
     *       200:
     *         description: "인플루언서 설정 완료"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isSuccess:
     *                   type: boolean
     *                   description: "요청 성공 여부"
     *                   example: true
     *                 code:
     *                   type: string
     *                   description: "응답 코드"
     *                   example: "COMMON200"
     *                 message:
     *                   type: string
     *                   description: "응답 메시지"
     *                   example: "인플루언서 설정 완료"
     *                 result:
     *                   type: object
     *                   properties:
     *                     userId:
     *                       type: integer
     *                       description: "인플루언서로 설정된 유저의 ID"
     *                       example: 123
     *       403:
     *         description: "관리자 권한 없음"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isSuccess:
     *                   type: boolean
     *                   description: "요청 성공 여부"
     *                   example: false
     *                 code:
     *                   type: string
     *                   description: "응답 코드"
     *                   example: "FORBIDDEN"
     *                 message:
     *                   type: string
     *                   description: "관리자 권한이 없습니다."
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.patch(
      '/users/:userId/influencer',
      authenticateJWT,
      this.setInfluencer.bind(this)
    );
  }

  private async manageUser(req: Request, res: Response) {
    const data = req.body;
    res.status(StatusCodes.OK).json(data);
  }

  private async monitorUser(req: Request, res: Response) {
    const data = req.body;
    res.status(StatusCodes.OK).json(data);
  }

  private async setInfluencer(req: Request, res: Response) {
    if (req.user.role != 'ADMIN') {
      throw new NotAdminError({ role: req.user.role });
    }

    const userId = +req.params.userId;
    await this.userService.setInfluencer(userId);
    res
      .status(StatusCodes.OK)
      .success({ message: '인플루언서 설정 완료', userId: userId });
  }
}
