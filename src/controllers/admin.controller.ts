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
    this.router.put('/admin/password', authenticateJWT, this.updatePassword.bind(this));
  }

  // 관리자 계정 생성
  public async createAdmin(req: Request, res: Response): Promise<void> {
    const data: AdminCreateDto = req.body;
    const newAdmin = await this.adminService.createAdmin(data.email, data.password);
    res.status(201).json({ isSuccess: true, message: '관리자 계정이 생성되었습니다.', result: newAdmin });
  }

  // 관리자 로그인
  public async loginAdmin(req: Request, res: Response): Promise<void> {
    const data: AdminLoginDto = req.body;
    const tokens = await this.adminService.loginAdmin(data.email, data.password);
    res.status(200).json({ isSuccess: true, message: '로그인 성공', result: tokens });
  }

  // 관리자 비밀번호 변경
  public async updatePassword(req: Request, res: Response): Promise<void> {
    const adminId = req.user?.userId;
    const data: PasswordUpdateDto = req.body;
    const result = await this.adminService.updatePassword(adminId, data.oldPassword, data.newPassword);
    res.status(200).json({ isSuccess: true, message: result.message });
  }
}