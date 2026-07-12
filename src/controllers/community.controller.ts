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
    
    this.router.post('/tips/:tipId/like', 
      authenticateJWT, 
      this.toggleLike.bind(this));
    // 꿀팁 좋아요 토글 
  
    this.router.post('/tips/:tipId/bookmark', 
      authenticateJWT, 
      this.toggleBookmark.bind(this));
    
    //꿀팁 북마크 토글 

      this.router.get(
        '/users/saved-tips',
        authenticateJWT,
        this.getSavedTips.bind(this)
      );
    //유저별 꿀팁 북마크 조회 
    this.router.get('/comments', 
      authenticateJWT,
      this.getAllComments.bind(this)
    ); // 전체 댓글 조회

    this.router.get('/comments/:commentId',
      authenticateJWT,
      this.getCommentById.bind(this)
    ); // 특정 댓글 상세 조회
    
  }

  /**
   * @swagger
   * /api/v1/tips/{tipId}/comments:
   *   post:
   *     summary: 꿀팁에 댓글 추가
   *     description: 로그인한 사용자가 특정 꿀팁에 댓글을 남깁니다.
   *     tags:
   *       - Communities
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
   *       - Communities
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
   *       - Communities
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
 *     summary: "팁 좋아요 토글"
 *     description: "사용자가 특정 팁에 대해 좋아요를 추가하거나 취소할 수 있습니다."
 *     tags:
 *       - Communities
 *     security:
 *       - bearerAuth: []  # JWT 인증 필요
 *     parameters:
 *       - in: path
 *         name: tipId
 *         required: true
 *         description: "좋아요를 토글할 팁의 ID"
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: "좋아요 토글 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "좋아요가 처리되었습니다."
 *       400:
 *         description: "잘못된 요청 (유효하지 않은 ID)"
 *       401:
 *         description: "인증 실패 (JWT 필요)"
 *       404:
 *         description: "팁을 찾을 수 없음"
 *       500:
 *         description: "서버 내부 오류"
 */
private async toggleLike(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const tipId = parseInt(req.params.tipId, 10);

    const response = await this.communityService.toggleLike(userId, tipId);
    res.status(StatusCodes.OK).json({
      isSuccess: true,
      message: response.message,
    });
  } catch (error) {
    next(error);
  }
}

/**
   * @swagger
   * /api/v1/tips/{tipId}/bookmark:
   *   post:
   *     summary: "팁 북마크 토글"
   *     description: "사용자가 특정 팁을 북마크하거나 취소합니다."
   *     tags:
   *       - Communities
   *     parameters:
   *       - in: path
   *         name: tipId
   *         required: true
   *         description: "북마크할 팁의 ID"
   *         schema:
   *           type: integer
   *           example: 1
   *     responses:
   *       200:
   *         description: "북마크 성공 또는 취소"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "북마크가 추가되었습니다."
   */
private async toggleBookmark(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const tipId = parseInt(req.params.tipId, 10);

    const result = await this.communityService.toggleBookmark(userId, tipId);
    res.status(StatusCodes.OK).json({ isSuccess: true, ...result });
  } catch (error) {
    next(error);
  }
}


/**
 * @swagger
 * /api/v1/users/saved-tips:
 *   get:
 *     summary: "사용자의 저장된 꿀팁 목록 조회"
 *     description: "현재 로그인한 사용자가 저장한 꿀팁 목록을 반환합니다."
 *     tags:
 *       - Communities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "저장된 꿀팁 목록 조회 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "저장된 꿀팁 목록 조회 성공"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tipId:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "청소 꿀팁"
 *                       content:
 *                         type: string
 *                         example: "바닥 청소할 때 꿀팁 공유!"
 *                       author:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: integer
 *                             example: 5
 *                           nickname:
 *                             type: string
 *                             example: "JohnDoe"
 *                           profileImageUrl:
 *                             type: string
 *                             example: "https://example.com/profile.jpg"
 *                       imageUrls:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             media_url:
 *                               type: string
 *                               example: "https://s3.amazonaws.com/bucket/image.jpg"
 *                             media_type:
 *                               type: string
 *                               example: "image/png"
 *                       likeCount:
 *                         type: integer
 *                         example: 15
 *                         description: "좋아요 수"
 *                       saveCount:
 *                         type: integer
 *                         example: 10
 *                         description: "북마크(저장) 수"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-17T12:00:00Z"
 *       401:
 *         description: "인증되지 않은 요청"
 *       500:
 *         description: "서버 오류"
 */


public async getSavedTips(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId; // 토큰에서 가져옴

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        isSuccess: false,
        message: 'Unauthorized. 로그인 필요',
      });
    }

    const savedTips = await this.communityService.getSavedTips(userId);

    res.status(StatusCodes.OK).json({
      isSuccess: true,
      message: '저장된 꿀팁 목록 조회 성공',
      result: savedTips,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * @swagger
 * /api/v1/comments:
 *   get:
 *     summary: "전체 댓글 조회 (무한 스크롤 지원)"
 *     description: "모든 댓글을 최신순으로 조회합니다."
 *     tags:
 *       - Communities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "전체 댓글 조회 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "전체 댓글 조회 성공"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       commentId:
 *                         type: integer
 *                         example: 123
 *                       content:
 *                         type: string
 *                         example: "이 꿀팁 정말 유용하네요!"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-19T12:00:00Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: integer
 *                             example: 10
 *                           nickname:
 *                             type: string
 *                             example: "john_doe"
 *                           profileImageUrl:
 *                             type: string
 *                             example: "https://example.com/profile.jpg"
 *                       tip:
 *                         type: object
 *                         properties:
 *                           tipId:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "청소 꿀팁 대공개"
 *       401:
 *         description: "인증 실패"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */

public async getAllComments(req: Request, res: Response, next: NextFunction) {
  try {
    const comments = await this.communityService.getAllComments();
    res.status(StatusCodes.OK).json({
      isSuccess: true,
      message: '전체 댓글 조회 성공',
      result: comments,
    });
  } catch (error) {
    next(error);
  }
}

  /**
   * @swagger
   * /api/v1/comments/{commentId}:
   *   get:
   *     summary: "댓글 상세 조회"
   *     description: "인증된 사용자가 특정 댓글의 상세 정보를 조회합니다."
   *     tags:
   *       - Communities
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: commentId
   *         required: true
   *         schema:
   *           type: integer
   *         description: "조회할 댓글의 ID"
   *     responses:
   *       200:
   *         description: "댓글 조회 성공"
   *       401:
   *         description: "인증 실패"
   *       404:
   *         description: "댓글을 찾을 수 없음"
   */
  public async getCommentById(req: Request, res: Response, next: NextFunction) {
    try {
      const commentId = parseInt(req.params.commentId, 10);
      if (!commentId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: '유효한 댓글 ID가 필요합니다.' });
      }

      const comment = await this.communityService.getCommentById(commentId);
      if (!comment) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: '댓글을 찾을 수 없습니다.' });
      }

      res.status(StatusCodes.OK).json({
        isSuccess: true,
        message: '댓글 조회 성공',
        result: comment,
      });
    } catch (error) {
      next(error);
    }
  }


}


