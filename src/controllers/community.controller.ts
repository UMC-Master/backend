import { Router, Request, Response, NextFunction } from 'express';
import { CommunityService } from '../services/community.service.js';
import { StatusCodes } from 'http-status-codes'; // StatusCodes를 임포트
import { authenticateJWT } from '../middlewares/authenticateJWT'; // 인증 미들웨어 import

export class CommunityController {
  public router: Router;
  private communityService: CommunityService;

  constructor() {
    this.router = Router();
    this.communityService = new CommunityService();
    this.initializeRoutes();
  }

  // 라우트를 정의
  private initializeRoutes() {
    this.router.post('/api/v1/tips/share', authenticateJWT, this.shareTip.bind(this));
    this.router.post('/api/v1/tips/:tipId/comments', authenticateJWT, this.commentOnTip.bind(this));
    this.router.post('/api/v1/tips/:tipId/like', authenticateJWT, this.likeTip.bind(this));
    this.router.post('/api/v1/tips/:tipId/save', authenticateJWT, this.saveTip.bind(this));
  }

  /**
   * @swagger
   * /api/v1/tips/share:
   *   post:
   *     summary: 사용자 간 꿀팁 공유
   *     description: 사용자가 다른 사람과 꿀팁을 공유합니다.
   *     tags:
   *       - communities
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 example: "집중력 향상 방법"
   *               content:
   *                 type: string
   *                 example: "포모도로 기법을 사용해 생산성을 높여보세요."
   *     responses:
   *       200:
   *         description: 꿀팁 공유 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 resultType:
   *                   type: string
   *                   example: "SUCCESS"
   *                 success:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: "꿀팁을 성공적으로 공유했습니다."
   *       400:
   *         description: 잘못된 요청
   *       500:
   *         description: 서버 오류
   */
  private async shareTip(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, content, category } = req.body;
      const userId = req.user?.userId;

      if (!title || !content) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          isSuccess: false,
          code: 'COMMON400',
          message: '꿀팁 내용이 없습니다.',
        });
      }

      const newTip = await this.communityService.createTip({ userId, title, content, category });
      res.status(StatusCodes.OK).json({
        isSuccess: true,
        code: 'COMMON200',
        message: '꿀팁을 성공적으로 공유했습니다.',
        result: { data: newTip },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tips/{tipId}/comments:
   *   post:
   *     summary: 꿀팁에 대한 댓글
   *     description: 사용자가 특정 꿀팁에 대해 댓글을 달 수 있습니다.
   *     tags:
   *       - communities
   *     parameters:
   *       - in: path
   *         name: tipId
   *         required: true
   *         description: 댓글을 달 꿀팁의 ID
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               comment:
   *                 type: string
   *                 example: "좋은 꿀팁입니다! 바로 시도해보겠습니다."
   *     responses:
   *       200:
   *         description: 댓글 달기 성공
   *       400:
   *         description: 잘못된 요청
   */
  private async commentOnTip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const tipId = parseInt(req.params.tipId, 10);
      const { comment } = req.body;

      if (!comment) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          isSuccess: false,
          code: 'COMMON400',
          message: '댓글 내용이 비어있습니다.',
        });
      }

      const newComment = await this.communityService.commentOnTip(userId, tipId, comment);
      res.status(StatusCodes.OK).json({
        isSuccess: true,
        code: 'COMMON200',
        message: '댓글이 성공적으로 추가되었습니다.',
        result: { data: newComment },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tips/{tipId}/like:
   *   post:
   *     summary: 꿀팁 추천 (좋아요 토글 기능)
   *     description: 사용자가 특정 꿀팁에 대해 좋아요를 클릭하거나 취소할 수 있습니다.
   *     tags:
   *       - communities
   */
  private async likeTip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const tipId = parseInt(req.params.tipId, 10);

      const updatedTip = await this.communityService.likeTip(userId, tipId);
      res.status(StatusCodes.OK).json({
        isSuccess: true,
        code: 'COMMON200',
        message: '좋아요가 성공적으로 처리되었습니다.',
        result: { data: updatedTip },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tips/{tipId}/save:
   *   post:
   *     summary: 꿀팁 저장
   *     description: 사용자가 특정 꿀팁을 저장할 수 있습니다.
   *     tags:
   *       - communities
   */
  private async saveTip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const tipId = parseInt(req.params.tipId, 10);

      const updatedTip = await this.communityService.saveTip(userId, tipId);
      res.status(StatusCodes.OK).json({
        isSuccess: true,
        code: 'COMMON200',
        message: '꿀팁이 성공적으로 저장되었습니다.',
        result: { data: updatedTip },
      });
    } catch (error) {
      next(error);
    }
  }
}