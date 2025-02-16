import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HashtagService } from '../services/hashtag.service.js';
import 'express-async-errors';

export class HashtagController {
  private hashtagService: HashtagService;
  public router: Router;

  constructor() {
    this.hashtagService = new HashtagService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /api/v1/hashtags/popular:
     *   get:
     *     summary: "인기 해시태그 조회"
     *     description: "매거진의 좋아요 및 북마크 수 기반으로 인기 해시태그를 가져옵니다."
     *     tags:
     *       - Hashtag
     *     parameters:
     *       - in: query
     *         name: limit
     *         required: false
     *         description: "조회할 해시태그 개수 (기본값: 6)"
     *         schema:
     *           type: number
     *     responses:
     *       200:
     *         description: "인기 해시태그 조회 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isSuccess:
     *                   type: boolean
     *                   description: "요청 성공 여부"
     *                 code:
     *                   type: string
     *                   description: "응답 코드"
     *                   example: "COMMON200"
     *                 message:
     *                   type: string
     *                   description: "응답 메시지"
     *                   example: "성공입니다."
     *                 result:
     *                   type: object
     *                   properties:
     *                     hashtags:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           hashtag_id:
     *                             type: number
     *                             description: "해시태그 ID"
     *                           name:
     *                             type: string
     *                             description: "해시태그명"
     *                           popularity:
     *                             type: number
     *                             description: "인기 점수 (좋아요 + 북마크 합산)"
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.get('/hashtags/popular', this.getPopularHashtags.bind(this));
  }

  private async getPopularHashtags(req: Request, res: Response) {
    const limit: number = Number(req.query.limit) || 10;
    const hashtags = await this.hashtagService.findPopularHashtag(limit);

    res.status(StatusCodes.OK).success(hashtags);
  }
}
