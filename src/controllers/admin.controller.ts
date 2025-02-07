import { Router, Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { AdminCreateDto, AdminLoginDto, PasswordUpdateDto } from '../dtos/admin.dto';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import 'express-async-errors';

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
    this.router.put('/api/v1/admin/password', authenticateJWT, this.updatePassword.bind(this));
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
   *             $ref: '#/components/schemas/AdminCreateDto'
   *     responses:
   *       201:
   *         description: 관리자 계정 생성 성공
   *       400:
   *         description: 잘못된 요청 데이터
   */
  public async createAdmin(req: Request, res: Response): Promise<void> {
    const data: AdminCreateDto = req.body;
    const newAdmin = await this.adminService.createAdmin(data.email, data.password);
    res.status(201).json({ isSuccess: true, message: '관리자 계정이 생성되었습니다.', result: newAdmin });
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
   *             $ref: '#/components/schemas/AdminLoginDto'
   *     responses:
   *       200:
   *         description: 로그인 성공
   *       401:
   *         description: 인증 실패
   */
  public async loginAdmin(req: Request, res: Response): Promise<void> {
    const data: AdminLoginDto = req.body;
    const tokens = await this.adminService.loginAdmin(data.email, data.password);
    res.status(200).json({ isSuccess: true, message: '로그인 성공', result: tokens });
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
   *             $ref: '#/components/schemas/PasswordUpdateDto'
   *     responses:
   *       200:
   *         description: 비밀번호 변경 성공
   *       401:
   *         description: 인증 실패
   */
  public async updatePassword(req: Request, res: Response): Promise<void> {
    const adminId = req.user?.userId;
    const data: PasswordUpdateDto = req.body;
    const result = await this.adminService.updatePassword(adminId, data.oldPassword, data.newPassword);
    res.status(200).json({ isSuccess: true, message: result.message });
  }
}