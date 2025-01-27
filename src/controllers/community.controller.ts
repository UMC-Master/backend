import { Router, Request, Response, NextFunction } from 'express';
import { CommunityService } from '../services/community.service.js';
import { StatusCodes } from 'http-status-codes'; // StatusCodes를 임포트
import { authenticateJWT } from '../middlewares/authenticateJWT'; // 인증 미들웨어 import
import 'express-async-errors';

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
    this.router.post('/api/v1/tips/:tipId/comments', authenticateJWT, this.commentOnTip.bind(this));//꿀팁 댓글 생성
    this.router.delete('/api/v1/tips/:tipId/comments/:commentId', authenticateJWT, this.deleteComment.bind(this)); // 꿀팁 댓글 삭제
    this.router.put('/api/v1/tips/:tipId/comments/:commentId', authenticateJWT, this.updateComment.bind(this));//꿀팁 댓글 수정 
    this.router.post('/api/v1/tips/:tipId/like', authenticateJWT, this.likeTip.bind(this)); // 꿀팁 좋아요 
    this.router.delete('/api/v1/tips/:tipId/like', authenticateJWT, this.removeLike.bind(this)); // 꿀팁 좋아요 삭제 
    this.router.post('/api/v1/tips/:tipId/save', authenticateJWT, this.saveTip.bind(this));//꿀팁 저장 
    this.router.delete('/api/v1/tips/:tipId/save', authenticateJWT, this.removeSave.bind(this));// 꿀팁 저장 삭제  
  
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
   * /api/v1/tips/{tipId}/comments/{commentId}:
   *   delete:
   *     summary: 꿀팁 댓글 삭제
   *     description: 사용자가 특정 꿀팁의 댓글을 삭제합니다.
   *     tags:
   *       - communities
   *     parameters:
   *       - in: path
   *         name: tipId
   *         required: true
   *         description: 댓글이 달린 꿀팁의 ID
   *         schema:
   *           type: integer
   *       - in: path
   *         name: commentId
   *         required: true
   *         description: 삭제할 댓글의 ID
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 댓글 삭제 성공
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
   *                       example: "댓글이 성공적으로 삭제되었습니다."
   *       400:
   *         description: 잘못된 요청
   *       500:
   *         description: 서버 오류
   */
private async deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { commentId } = req.params;
    await this.communityService.deleteComment(parseInt(commentId, 10));
    res.status(StatusCodes.OK).json({
      isSuccess: true,
      code: 'COMMON200',
      message: '댓글이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/v1/tips/{tipId}/comments/{commentId}:
 *   put:
 *     summary: 댓글 수정
 *     description: 특정 꿀팁에 대한 댓글을 수정합니다.
 *     tags:
 *       - communities
 *     parameters:
 *       - in: path
 *         name: tipId
 *         required: true
 *         description: 댓글이 속한 꿀팁의 ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: 수정할 댓글의 ID
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
 *                 example: "수정된 댓글 내용"
 *     responses:
 *       200:
 *         description: 댓글 수정 성공
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
 *                   example: "댓글이 성공적으로 수정되었습니다."
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 댓글을 찾을 수 없음
 */



private async updateComment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const tipId = parseInt(req.params.tipId, 10);
    const commentId = parseInt(req.params.commentId, 10);
    const { comment } = req.body;

    if (!comment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        isSuccess: false,
        code: 'COMMON400',
        message: '댓글 내용이 비어있습니다.',
      });
    }

    const updatedComment = await this.communityService.updateComment(userId, tipId, commentId, comment);
    res.status(StatusCodes.OK).json({
      isSuccess: true,
      code: 'COMMON200',
      message: '댓글이 성공적으로 수정되었습니다.',
      result: { data: updatedComment },
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
 * /api/v1/tips/{tipId}/like:
 *   delete:
 *     summary: 좋아요 삭제 (취소)
 *     description: 사용자가 특정 꿀팁에 대해 눌렀던 좋아요를 취소합니다.
 *     tags:
 *       - communities
 *     parameters:
 *       - in: path
 *         name: tipId
 *         required: true
 *         description: 좋아요를 취소할 꿀팁의 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 좋아요 취소 성공
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
 *                       example: "좋아요가 성공적으로 취소되었습니다."
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
 *       404:
 *         description: 좋아요 정보를 찾을 수 없음
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
 *                       example: "좋아요 정보를 찾을 수 없습니다."
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
  
    // 좋아요 삭제 (취소)
    private async removeLike(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = req.user?.userId;
        const tipId = parseInt(req.params.tipId, 10);
  
        await this.communityService.removeLike(userId, tipId);
        res.status(StatusCodes.OK).json({
          isSuccess: true,
          code: 'COMMON200',
          message: '좋아요가 성공적으로 취소되었습니다.',
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


    /**
 * @swagger
 * /api/v1/tips/{tipId}/save:
 *   delete:
 *     summary: 꿀팁 저장 삭제
 *     description: 사용자가 저장한 팁을 삭제합니다.
 *     tags:
 *       - communities
 *     parameters:
 *       - in: path
 *         name: tipId
 *         required: true
 *         description: 삭제할 저장된 팁의 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 팁 저장 삭제 성공
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
 *                       example: "팁 저장이 성공적으로 삭제되었습니다."
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
 *                       example: "잘못된 팁 ID"
 *       404:
 *         description: 저장된 팁을 찾을 수 없음
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
 *                       example: "저장된 팁을 찾을 수 없습니다."
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
  
    // 팁 저장 취소
    private async removeSave(req: Request, res: Response, next: NextFunction) {
      try {
        const userId = req.user?.userId;
        const tipId = parseInt(req.params.tipId, 10);
  
        await this.communityService.removeSave(userId, tipId);
        res.status(StatusCodes.OK).json({
          isSuccess: true,
          code: 'COMMON200',
          message: '꿀팁 저장이 취소되었습니다.',
        });
      } catch (error) {
        next(error);
      }
    }


}