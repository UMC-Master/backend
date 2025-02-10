import { Router, Request, Response, NextFunction } from 'express';
import { CommunityService } from '../services/community.service.js';
import { StatusCodes } from 'http-status-codes'; // StatusCodes를 임포트
import { authenticateJWT } from '../middlewares/authenticateJWT'; // 인증 미들웨어 import
import 'express-async-errors';
import { UnauthorizedError, ValidationError } from '../errors/errors'; // 커스텀 에러 임포트

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
    this.router.post(
      '/tips/:tipId/comments',
      authenticateJWT,
      this.commentOnTip.bind(this)
    ); //꿀팁 댓글 생성
    this.router.delete(
      '/tips/:tipId/comments/:commentId',
      authenticateJWT,
      this.deleteComment.bind(this)
    ); // 꿀팁 댓글 삭제
    this.router.put(
      '/tips/:tipId/comments/:commentId',
      authenticateJWT,
      this.updateComment.bind(this)
    ); //꿀팁 댓글 수정
    this.router.post(
      '/tips/:tipId/like',
      authenticateJWT,
      this.likeTip.bind(this)
    ); // 꿀팁 좋아요
    this.router.delete(
      '/tips/:tipId/like',
      authenticateJWT,
      this.removeLike.bind(this)
    ); // 꿀팁 좋아요 삭제
    this.router.post(
      '/tips/:tipId/save',
      authenticateJWT,
      this.saveTip.bind(this)
    ); //꿀팁 저장
    this.router.delete(
      '/tips/:tipId/save',
      authenticateJWT,
      this.removeSave.bind(this)
    ); // 꿀팁 저장 삭제
  }

  /**
   * @swagger
   * /api/v1/tips/{tipId}/comments:
   *   post:
   *     summary: 꿀팁에 댓글 추가
   *     description: 로그인한 사용자가 특정 꿀팁에 댓글을 남깁니다.
   *     tags:
   *       - Comments
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tipId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 댓글을 추가할 꿀팁의 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               comment:
   *                 type: string
   *                 example: "이 꿀팁 정말 유용하네요!"
   *                 description: 추가할 댓글 내용
   *     responses:
   *       200:
   *         description: 댓글 추가 성공
   *       400:
   *         description: 잘못된 요청 (유효하지 않은 tipId 또는 댓글 내용 없음)
   *       401:
   *         description: 인증 필요 (토큰 없음)
   */
  private async commentOnTip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const tipId = parseInt(req.params.tipId, 10);
      const { comment } = req.body;

      if (userId === undefined) {
        throw new UnauthorizedError('로그인이 필요합니다.', null);
      }

      if (isNaN(tipId)) {
        throw new ValidationError('올바른 Tip ID를 입력해주세요.', {
          tipId: req.params.tipId,
        });
      }

      if (!comment) {
        throw new ValidationError('댓글 내용이 비어있습니다.', null);
      }

      const newComment = await this.communityService.commentOnTip(
        userId,
        tipId,
        comment
      );

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

      if (userId === undefined) {
        throw new UnauthorizedError('로그인이 필요합니다.', null);
      }

      if (isNaN(tipId) || isNaN(commentId)) {
        throw new ValidationError('올바른 ID를 입력해주세요.', {
          tipId: req.params.tipId,
          commentId: req.params.commentId,
        });
      }

      if (!comment) {
        throw new ValidationError('댓글 내용이 비어있습니다.', null);
      }

      const updatedComment = await this.communityService.updateComment(
        userId,
        tipId,
        commentId,
        comment
      );

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
   *     summary: 꿀팁 좋아요 추가
   *     description: 특정 꿀팁을 좋아요합니다.
   *     tags:
   *       - Likes
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tipId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 좋아요할 꿀팁의 ID
   *     responses:
   *       200:
   *         description: 좋아요 성공
   *       400:
   *         description: 잘못된 요청 (유효하지 않은 tipId)
   *       401:
   *         description: 인증 필요 (토큰 없음)
   */
  private async likeTip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const tipId = parseInt(req.params.tipId, 10);

      if (userId === undefined) {
        throw new UnauthorizedError('로그인이 필요합니다.', null);
      }

      if (isNaN(tipId)) {
        throw new ValidationError('올바른 Tip ID를 입력해주세요.', {
          tipId: req.params.tipId,
        });
      }

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

      if (userId === undefined) {
        throw new UnauthorizedError('로그인이 필요합니다.', null);
      }

      if (isNaN(tipId)) {
        throw new ValidationError('올바른 Tip ID를 입력해주세요.', {
          tipId: req.params.tipId,
        });
      }

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
   *     description: 특정 꿀팁을 저장합니다.
   *     tags:
   *       - Saves
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tipId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 저장할 꿀팁의 ID
   *     responses:
   *       200:
   *         description: 꿀팁 저장 성공
   *       400:
   *         description: 잘못된 요청 (유효하지 않은 tipId)
   *       401:
   *         description: 인증 필요 (토큰 없음)
   */
  private async saveTip(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const tipId = parseInt(req.params.tipId, 10);

      if (userId === undefined) {
        throw new UnauthorizedError('로그인이 필요합니다.', null);
      }

      if (isNaN(tipId)) {
        throw new ValidationError('올바른 Tip ID를 입력해주세요.', {
          tipId: req.params.tipId,
        });
      }

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

      if (userId === undefined) {
        throw new UnauthorizedError('로그인이 필요합니다.', null);
      }

      if (isNaN(tipId)) {
        throw new ValidationError('올바른 Tip ID를 입력해주세요.', {
          tipId: req.params.tipId,
        });
      }

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
