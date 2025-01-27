import { Router, Request, Response, NextFunction } from 'express';
import { TipService } from '../services/tip.service.js'; // 팁 서비스 import
import { StatusCodes } from 'http-status-codes'; // StatusCodes import
import { authenticateJWT } from '../middlewares/authenticateJWT'; // 인증 미들웨어 import
import 'express-async-errors';

export class TipController {
  public tipService: TipService; // TipService 타입 명시
  public router: Router;

  constructor() {
    this.tipService = new TipService(); // TipService 인스턴스 생성
    this.router = Router();
    this.initializeRoutes();  // 라우트 초기화
  }

  private initializeRoutes() {
    // 팁 생성, 수정, 삭제 라우트 정의
    this.router.post('/api/v1/tips', authenticateJWT, this.createTip.bind(this)); // 팁 생성
    this.router.put('/api/v1/tips/:tipId', authenticateJWT, this.updateTip.bind(this)); // 팁 수정
    this.router.delete('/api/v1/tips/:tipId', authenticateJWT, this.deleteTip.bind(this)); // 팁 삭제
  }

  /**
   * @swagger
   * /api/v1/tips:
   *   post:
   *     summary: "새로운 팁 생성"
   *     description: "새로운 팁을 생성하여 시스템에 저장합니다."
   *     tags:
   *       - Tips
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *     responses:
   *       200:
   *         description: "새로운 팁 생성 성공"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 tipId:
   *                   type: integer
   *                   example: 1
   *       400:
   *         description: "잘못된 요청"
   */
  // 팁 생성
  public async createTip(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, content, hashtags } = req.body;
      const userId = req.user?.userId;

      if (!title || !content) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          isSuccess: false,
          message: '제목 혹은 내용을 입력하셔야합니다다.',
        });
      }

      const newTip = await this.tipService.createTip({
        userId: userId,
        title: title,
        content: content,
        hashtags: hashtags, // 사용자가 선택한 해시태그
      });

      res.status(StatusCodes.CREATED).json({
        isSuccess: true,
        message: '팁이 생성되었습니다.',
        result: { tip: newTip },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tips/{tipId}:
   *   put:
   *     summary: "기존 팁 수정"
   *     description: "기존의 팁을 수정하여 시스템에 업데이트합니다."
   *     tags:
   *       - Tips
   *     parameters:
   *       - in: path
   *         name: tipId
   *         required: true
   *         description: "수정할 팁의 고유 ID"
   *         schema:
   *           type: integer
   *           example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *     responses:
   *       200:
   *         description: "팁 수정 성공"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 tipId:
   *                   type: integer
   *                   example: 1
   *       400:
   *         description: "잘못된 요청"
   */
  private async updateTip(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, content } = req.body;  // 수정할 제목과 내용
      const tipId = parseInt(req.params.tipId, 10); // 팁 ID

      if (!title || !content) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          isSuccess: false,
          code: 'COMMON400',
          message: 'Title and content are required.',
        });
      }

      // 팁 수정
      const updatedTip = await this.tipService.updateTip(tipId, title, content);  
      res.status(StatusCodes.OK).json({
        isSuccess: true,
        code: 'COMMON200',
        message: 'Tip updated successfully.',
        result: { data: updatedTip },  // 수정된 팁을 반환
      });
    } catch (error) {
      next(error);  // 에러 처리
    }
  }

  /**
   * @swagger
   * /api/v1/tips/{tipId}:
   *   delete:
   *     summary: "팁 삭제"
   *     description: "특정 팁을 삭제합니다."
   *     tags:
   *       - Tips
   *     parameters:
   *       - in: path
   *         name: tipId
   *         required: true
   *         description: "삭제할 팁의 고유 ID"
   *         schema:
   *           type: integer
   *           example: 1
   *     responses:
   *       200:
   *         description: "팁 삭제 성공"
   *       400:
   *         description: "잘못된 요청"
   */
  private async deleteTip(req: Request, res: Response, next: NextFunction) {
    try {
      const tipId = parseInt(req.params.tipId, 10);  // 삭제할 팁 ID

      // 팁 삭제
      await this.tipService.deleteTip(tipId);  
      res.status(StatusCodes.OK).json({
        isSuccess: true,
        code: 'COMMON200',
        message: 'Tip deleted successfully.',
      });
    } catch (error) {
      next(error);  // 에러 처리
    }
  }
}
