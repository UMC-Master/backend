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
    this.router.get('/api/v1/tips', this.getAllTips.bind(this)); // 전체 꿀팁 조회
    this.router.get('/api/v1/tips/sorted', this.getSortedTips.bind(this)); // 정렬된 꿀팁 조회
    this.router.get('/api/v1/tips/search', this.searchTips.bind(this)); 
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
   *               hashtags:
   *                 type: array
   *                 items:
   *                   type: string
   *                   example: ["#food", "#travel"]
   *     responses:
   *       201:
   *         description: "새로운 팁 생성 성공"
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
   *                   example: "팁이 생성되었습니다."
   *                 result:
   *                   type: object
   *                   properties:
   *                     tip:
   *                       type: object
   *                       properties:
   *                         tipId:
   *                           type: integer
   *                           example: 1
   *                         title:
   *                           type: string
   *                           example: "Amazing Food Tips"
   *                         description:
   *                           type: string
   *                           example: "Don't miss the local cuisine when traveling."
   *                         author:
   *                           type: object
   *                           properties:
   *                             userId:
   *                               type: integer
   *                               example: 1
   *                             nickname:
   *                               type: string
   *                               example: "John Doe"
   *                             profileImageUrl:
   *                               type: string
   *                               example: "https://example.com/profile.jpg"
   *                         createdAt:
   *                           type: string
   *                           example: "2023-01-01T00:00:00Z"
   *                         updatedAt:
   *                           type: string
   *                           example: "2023-01-01T00:00:00Z"
   *                         likesCount:
   *                           type: integer
   *                           example: 5
   *                         commentsCount:
   *                           type: integer
   *                           example: 3
   *                         mediaUrls:
   *                           type: array
   *                           items:
   *                             type: string
   *                             example: ["https://example.com/media1.jpg"]
   *       400:
   *         description: "잘못된 요청"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 isSuccess:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "제목 혹은 내용을 입력하셔야합니다다."
   */
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
   *                 isSuccess:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "팁 수정 성공"
   *                 result:
   *                   type: object
   *                   properties:
   *                     tipId:
   *                       type: integer
   *                       example: 1
   *                     title:
   *                       type: string
   *                       example: "Updated Food Tips"
   *                     content:
   *                       type: string
   *                       example: "Make sure to try the street food!"
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

  
   /**
   * @swagger
   * /api/v1/tips:
   *   get:
   *     summary: "전체 꿀팁 조회 (페이지네이션)"
   *     description: "전체 꿀팁을 페이지네이션을 통해 조회합니다."
   *     tags:
   *       - Tips
   *     parameters:
   *       - in: query
   *         name: page
   *         required: false
   *         description: "현재 페이지 번호"
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         required: false
   *         description: "한 페이지에 표시될 꿀팁의 수"
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: "전체 꿀팁 조회 성공"
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
   *                   example: "전체 꿀팁 조회 성공"
   *                 result:
   *                   type: object
   *                   properties:
   *                     tips:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           tipId:
   *                             type: integer
   *                             example: 1
   *                           title:
   *                             type: string
   *                             example: "Amazing Food Tips"
   *                           description:
   *                             type: string
   *                             example: "Don't miss the local cuisine when traveling."
   *                           author:
   *                             type: object
   *                             properties:
   *                               userId:
   *                                 type: integer
   *                                 example: 1
   *                               nickname:
   *                                 type: string
   *                                 example: "John Doe"
   *                               profileImageUrl:
   *                                 type: string
   *                                 example: "https://example.com/profile.jpg"
   *                           createdAt:
   *                             type: string
   *                             example: "2023-01-01T00:00:00Z"
   *                           updatedAt:
   *                             type: string
   *                             example: "2023-01-01T00:00:00Z"
   *       400:
   *         description: "잘못된 요청"
   */
   public async getAllTips(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const tips = await this.tipService.getAllTips({
        page: Number(page),
        limit: Number(limit),
      });

      res.status(StatusCodes.OK).json({
        isSuccess: true,
        message: '전체 꿀팁 조회 성공',
        result: { tips },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tips/sorted:
   *   get:
   *     summary: "정렬된 꿀팁 조회"
   *     description: "정렬된 꿀팁을 조회합니다. 정렬 기준을 설정할 수 있습니다."
   *     tags:
   *       - Tips
   *     parameters:
   *       - in: query
   *         name: page
   *         required: false
   *         description: "현재 페이지 번호"
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         required: false
   *         description: "한 페이지에 표시될 꿀팁의 수"
   *         schema:
   *           type: integer
   *           default: 10
   *       - in: query
   *         name: sort
   *         required: false
   *         description: "정렬 기준 (latest, likes, saves)"
   *         schema:
   *           type: string
   *           enum: [latest, likes, saves]
   *           default: "latest"
   *     responses:
   *       200:
   *         description: "정렬된 꿀팁 조회 성공"
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
   *                   example: "정렬된 꿀팁 조회 성공"
   *                 result:
   *                   type: object
   *                   properties:
   *                     tips:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           tipId:
   *                             type: integer
   *                             example: 1
   *                           title:
   *                             type: string
   *                             example: "Amazing Food Tips"
   *                           description:
   *                             type: string
   *                             example: "Don't miss the local cuisine when traveling."
   *                           author:
   *                             type: object
   *                             properties:
   *                               userId:
   *                                 type: integer
   *                                 example: 1
   *                               nickname:
   *                                 type: string
   *                                 example: "John Doe"
   *                               profileImageUrl:
   *                                 type: string
   *                                 example: "https://example.com/profile.jpg"
   *                           createdAt:
   *                             type: string
   *                             example: "2023-01-01T00:00:00Z"
   *                           updatedAt:
   *                             type: string
   *                             example: "2023-01-01T00:00:00Z"
   *       400:
   *         description: "잘못된 요청"
   */
  public async getSortedTips(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, sort = 'latest' } = req.query;

      const tips = await this.tipService.getSortedTips({
        page: Number(page),
        limit: Number(limit),
        sort: String(sort),
      });

      res.status(StatusCodes.OK).json({
        isSuccess: true,
        message: '정렬된 꿀팁 조회 성공',
        result: { tips },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tips/search:
   *   get:
   *     summary: "팁 검색"
   *     description: "제목, 내용, 해시태그에서 검색어를 포함하는 팁을 검색합니다."
   *     tags:
   *       - Tips
   *     parameters:
   *       - in: query
   *         name: query
   *         schema:
   *           type: string
   *         required: true
   *         description: "검색어 (제목, 내용, 해시태그에서 검색)"
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         required: false
   *         description: "페이지 번호"
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         required: false
   *         description: "한 페이지에 표시할 팁 개수"
   *     responses:
   *       200:
   *         description: "팁 검색 결과 반환"
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
   *                   example: "팁 검색 성공"
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
   *                         example: "Amazing Food Tips"
   *                       description:
   *                         type: string
   *                         example: "Don't miss the local cuisine when traveling."
   *                       author:
   *                         type: object
   *                         properties:
   *                           userId:
   *                             type: integer
   *                             example: 1
   *                           nickname:
   *                             type: string
   *                             example: "John Doe"
   *                           profileImageUrl:
   *                             type: string
   *                             example: "https://example.com/profile.jpg"
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2023-01-01T00:00:00Z"
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                         example: "2023-01-01T00:00:00Z"
   *                       hashtags:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             hashtagId:
   *                               type: integer
   *                               example: 1
   *                             name:
   *                               type: string
   *                               example: "#food"
   *       400:
   *         description: "잘못된 요청 (검색어 누락)"
   */
  public async searchTips(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.query as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          isSuccess: false,
          message: "검색어(query)는 필수입니다.",
        });
      }

      const tips = await this.tipService.searchTips(query, page, limit);

      res.status(StatusCodes.OK).json({
        isSuccess: true,
        message: "팁 검색 성공",
        result: tips,
      });
    } catch (error) {
      next(error);
    }
  }

}
