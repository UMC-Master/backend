import { Router, Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import {
  AdminCreateDto,
  AdminLoginDto,
  PasswordUpdateDto,
} from '../dtos/admin.dto';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import 'express-async-errors';
import { UnauthorizedError, ValidationError } from '../errors/errors';

export class AdminController {
  private adminService: AdminService;
  public router: Router;

  constructor() {
    this.adminService = new AdminService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/admin/create', this.createAdmin.bind(this));
    this.router.post('/admin/login', this.loginAdmin.bind(this));
    this.router.put(
      '/admin/password',
      authenticateJWT,
      this.updatePassword.bind(this)
    );
  }

  /**
   * @swagger
   * /api/v1/admin/create:
   *   post:
   *     summary: 관리자 계정 생성
   *     description: 새로운 관리자 계정을 생성합니다.
   *     tags:
   *       - Admin
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: "admin@example.com"
   *               password:
   *                 type: string
   *                 example: "StrongPassword123!"
   *     responses:
   *       201:
   *         description: 관리자 계정 생성 성공
   *       400:
   *         description: 잘못된 요청 데이터
   */
  public async createAdmin(req: Request, res: Response): Promise<void> {
    const data: AdminCreateDto = req.body;
    const newAdmin = await this.adminService.createAdmin(
      data.email,
      data.password
    );
    res.status(201).json({
      isSuccess: true,
      message: '관리자 계정이 생성되었습니다.',
      result: newAdmin,
    });
  }

  /**
   * @swagger
   * /api/v1/admin/login:
   *   post:
   *     summary: 관리자 로그인
   *     description: 관리자 계정을 사용하여 로그인합니다.
   *     tags:
   *       - Admin
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: "admin@example.com"
   *               password:
   *                 type: string
   *                 example: "StrongPassword123!"
   *     responses:
   *       200:
   *         description: 로그인 성공
   *       401:
   *         description: 인증 실패
   */
  public async loginAdmin(req: Request, res: Response): Promise<void> {
    const data: AdminLoginDto = req.body;
    const tokens = await this.adminService.loginAdmin(
      data.email,
      data.password
    );
    res
      .status(200)
      .json({ isSuccess: true, message: '로그인 성공', result: tokens });
  }

  /**
   * @swagger
   * /api/v1/admin/password:
   *   put:
   *     summary: 관리자 비밀번호 변경
   *     description: 현재 로그인된 관리자의 비밀번호를 변경합니다.
   *     tags:
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               oldPassword:
   *                 type: string
   *                 example: "OldPassword123!"
   *               newPassword:
   *                 type: string
   *                 example: "NewStrongPassword456!"
   *     responses:
   *       200:
   *         description: 비밀번호 변경 성공
   *       401:
   *         description: 인증 실패
   */
  public async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const adminId = req.user?.userId;

      if (adminId === undefined) {
        throw new UnauthorizedError('로그인이 필요합니다.', null);
      }

      const data: PasswordUpdateDto = req.body;

      if (!data.oldPassword || !data.newPassword) {
        throw new ValidationError(
          '현재 비밀번호와 새 비밀번호는 필수 입력 항목입니다.',
          null
        );
      }

      const result = await this.adminService.updatePassword(
        adminId,
        data.oldPassword,
        data.newPassword
      );

      res.status(200).json({
        isSuccess: true,
        message: result.message,
      });
    } catch (error) {
      res.status(error instanceof ValidationError ? 400 : 500).json({
        isSuccess: false,
        message:
          error instanceof Error ? error.message : '비밀번호 변경 중 오류 발생',
      });
    }
  }
}
