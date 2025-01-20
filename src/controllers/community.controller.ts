// community.controller.ts
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



  private initializeRoutes(){
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
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 resultType:
     *                   type: string
     *                   example: "FAIL"
     *                 error:
     *                   type: object
     *                   properties:
     *                     reason:
     *                       type: string
     *                       example: "꿀팁 내용이 없습니다."
     *       500:
     *         description: 서버 오류
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 resultType:
     *                   type: string
     *                   example: "ERROR"
     *                 error:
     *                   type: object
     *                   properties:
     *                     reason:
     *                       type: string
     *                       example: "서버 내부 오류"
     */
    // 사용자 간 꿀팁 공유 (POST /api/v1/tips/share 공유할 꿀팁 정보 전송)
    this.router.post('/api/v1/tips/share', authenticateJWT,  this.shareTip);
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
     *                       example: "댓글이 성공적으로 추가되었습니다."
     *       400:
     *         description: 잘못된 요청
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 resultType:
     *                   type: string
     *                   example: "FAIL"
     *                 error:
     *                   type: object
     *                   properties:
     *                     reason:
     *                       type: string
     *                       example: "댓글 내용이 비어있습니다."
     */
    // 꿀팁에 대한 댓글 (POST /api/v1/tips/{tipId}/comments 댓글 내용 전송)
    this.router.post('/api/v1/tips/:tipId/comments', authenticateJWT, this.commentOnTip);

      /**
     * @swagger
     * /api/v1/tips/{tipId}/like:
     *   post:
     *     summary: 꿀팁 추천 (좋아요 토글 기능)
     *     description: 사용자가 특정 꿀팁에 대해 좋아요를 클릭하거나 취소할 수 있습니다.
     *     tags:
     *       - communities
     *     parameters:
     *       - in: path
     *         name: tipId
     *         required: true
     *         description: 좋아요를 눌렀거나 취소할 꿀팁의 ID
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: 좋아요 토글 성공
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
     *                       example: "좋아요가 성공적으로 토글되었습니다."
     *       400:
     *         description: 잘못된 요청
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 resultType:
     *                   type: string
     *                   example: "FAIL"
     *                 error:
     *                   type: object
     *                   properties:
     *                     reason:
     *                       type: string
     *                       example: "잘못된 꿀팁 ID"
     */
    // 좋아요 시스템 꿀팁 추천 (POST /api/v1/tips/{tipId}/like 좋아요 토글 기능)
    this.router.post('/api/v1/tips/:tipId/like',  authenticateJWT, this.likeTip);

    /**
     * @swagger
     * /api/v1/tips/{tipId}/save:
     *   post:
     *     summary: 꿀팁 저장
     *     description: 사용자가 특정 꿀팁을 저장할 수 있습니다.
     *     tags:
     *       - communities
     *     parameters:
     *       - in: path
     *         name: tipId
     *         required: true
     *         description: 저장할 꿀팁의 ID
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: 꿀팁 저장 성공
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
     *                       example: "꿀팁이 성공적으로 저장되었습니다."
     *       400:
     *         description: 잘못된 요청
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 resultType:
     *                   type: string
     *                   example: "FAIL"
     *                 error:
     *                   type: object
     *                   properties:
     *                     reason:
     *                       type: string
     *                       example: "잘못된 꿀팁 ID"
     */
    // 꿀팁 저장 (POST /api/v1/tips/{tipId}/save 저장 토글 기능)
    this.router.post('/api/v1/tips/:tipId/save',  authenticateJWT,this.saveTip);
  }


  // 팁 공유
  private shareTip = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content, category } = req.body;
      const userId = req.user?.userId;  // 인증된 사용자 정보
  

      // Validation
      if (!title || !content) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          isSuccess: false,
          code: 'COMMON400',
          message: '꿀팁 내용이 없습니다.',
          result: null,
        });
      }

      const newTip = await this.communityService.createTip({ userId, title, content, category });
      return res.status(StatusCodes.OK).json({
        isSuccess: true,
        code: 'COMMON200',
        message: '꿀팁을 성공적으로 공유했습니다.',
        result: { data: newTip },
      });
    } catch (error) {
      next(error);
    }
  };//확인 완료 


    // 팁 저장
    private saveTip = async (req: Request, res: Response, next: NextFunction) => {
      try {
        // req.user에서 userId를 가져옴
        const userId = req.user?.userId;  // 인증된 사용자 정보에서 userId를 가져옵니다.
        const tipId = parseInt(req.params.tipId, 10);  // URL 파라미터에서 tipId를 가져옵니다.
  
        if (!userId) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            isSuccess: false,
            message: 'User ID is missing',
          });
        }
  
        const updatedTip = await this.communityService.saveTip(userId, tipId);
        return res.status(StatusCodes.OK).json({
          isSuccess: true,
          code: 'COMMON200',
          message: '꿀팁이 성공적으로 저장되었습니다.',
          result: { data: updatedTip },
        });
      } catch (error) {
        next(error);
      }
    };
  
    // 팁 좋아요
    private likeTip = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user?.userId;  // 인증된 사용자 정보에서 userId를 가져옵니다.
        const tipId = parseInt(req.params.tipId, 10);  // URL 파라미터에서 tipId를 가져옵니다.
  
        if (!userId) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            isSuccess: false,
            message: 'User ID is missing',
          });
        }
  
        const updatedTip = await this.communityService.likeTip(userId, tipId);
        return res.status(StatusCodes.OK).json({
          isSuccess: true,
          code: 'COMMON200',
          message: '좋아요가 성공적으로 처리되었습니다.',
          result: { data: updatedTip },
        });
      } catch (error) {
        next(error);
      }
    };//확인 완료 

  // 팁 댓글 작성
  private commentOnTip = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const tipId = parseInt(req.params.tipId, 10);
      const { comment } = req.body;

      // Validation
      if (!comment) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          isSuccess: false,
          code: 'COMMON400',
          message: '댓글 내용이 비어있습니다.',
          result: null,
        });
      }

      const newComment = await this.communityService.commentOnTip(userId, tipId, comment);
      return res.status(StatusCodes.OK).json({
        isSuccess: true,
        code: 'COMMON200',
        message: '댓글이 성공적으로 추가되었습니다.',
        result: { data: newComment },
      });
    } catch (error) {
      next(error);
    }
  };//확인완료 

}







