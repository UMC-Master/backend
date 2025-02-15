import { Express, Router, Request, Response, NextFunction } from 'express';
import { TipService } from '../services/tip.service.js'; // 팁 서비스 import
import { StatusCodes } from 'http-status-codes'; // StatusCodes import
import { authenticateJWT } from '../middlewares/authenticateJWT'; // 인증 미들웨어 import
import 'express-async-errors';
import { imageUploader } from '../middlewares/imageUploader.js';
import {  ValidationError } from '../errors/errors';

export class TipController {
  public tipService: TipService; // TipService 타입 명시
  public router: Router;

  constructor() {
    this.tipService = new TipService(); // TipService 인스턴스 생성
    this.router = Router();
    this.initializeRoutes(); // 라우트 초기화
  }

  private initializeRoutes() {
    console.log('✅ TipController 라우트 등록됨');

    // 팁 생성, 수정, 삭제 라우트 정의
    this.router.post(
      '/tips',
      authenticateJWT,
      imageUploader.array('files', 5), // 최대 5개 이미지 업로드
      this.createTip.bind(this)
    );
    this.router.put('/tips/:tipId', authenticateJWT, this.updateTip.bind(this));//팁 수정
    this.router.delete(
      '/tips/:tipId',
      authenticateJWT,
      this.deleteTip.bind(this)
    );
    this.router.get('/tips', this.getAllTips.bind(this));
    this.router.get('/tips/:tipId', this.getTipDetails.bind(this));
    this.router.get('/tips/sorted', this.getSortedTips.bind(this));
    this.router.get('/tips/search', this.searchTips.bind(this));
  }

  /**
   * @swagger
   * /api/v1/tips:
   *   post:
   *     summary: "새로운 팁 생성 (이미지 포함)"
   *     description: "제목, 내용과 함께 이미지를 포함하여 새로운 팁을 생성합니다."
   *     tags:
   *       - Tips
   *     security:
   *       - bearerAuth: []
   *     consumes:
   *       - multipart/form-data
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: "팁 제목"
   *                 example: "Best Cleaning Tips"
   *               content:
   *                 type: string
   *                 description: "팁 내용"
   *                 example: "These are some great cleaning tips!"
   *               hashtags:
   *                 type: string
   *                 description: "쉼표로 구분된 해시태그 (예: 청소,설거지)"
   *                 example: "청소,설거지"
   *               files:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: "업로드할 이미지 파일"
   *     responses:
   *       201:
   *         description: "팁 생성 성공"
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
   *                     tipId:
   *                       type: integer
   *                       example: 1
   *                     title:
   *                       type: string
   *                       example: "Best Cleaning Tips"
   *                     content:
   *                       type: string
   *                       example: "These are some great cleaning tips!"
   *                     imageUrls:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           media_url:
   *                             type: string
   *                             example: "https://s3.amazonaws.com/bucket-name/path/to/image.jpg"
   *                           media_type:
   *                             type: string
   *                             example: "image/png"
   */

  public async createTip(req: Request & { files?: Express.Multer.File[] }, res: Response, next: NextFunction) {
    try {
      const { title, content, hashtags } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new ValidationError("로그인이 필요합니다.", null);
      }
      if (!title || !content) {
        throw new ValidationError("제목과 내용을 입력해야 합니다.", null);
      }

      const hashtagArray = typeof hashtags === "string" ? hashtags.split(",").map((tag) => tag.trim()) : hashtags || [];

      // ✅ S3에 업로드된 이미지 URL 리스트 가져오기
      const imageUrls = req.files?.map((file) => ({
        media_url: file.location, // S3 URL
        media_type: file.mimetype,
      })) || [];

      const newTip = await this.tipService.createTip({
        userId,
        title,
        content,
        hashtags: hashtagArray,
        imageUrls,
      });

      res.status(StatusCodes.CREATED).json(newTip);
    } catch (error) {
      next(error);
    }
  }
  
 
  /**
   * @swagger
   * /api/v1/tips/{tipId}:
   *   put:
   *     summary: "팁 수정 (이미지 추가 가능)"
   *     description: "기존의 팁을 수정하고, 새로운 이미지를 추가할 수 있습니다."
   *     tags:
   *       - Tips
   *     security:
   *       - bearerAuth: []
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - in: path
   *         name: tipId
   *         required: true
   *         description: "수정할 팁의 고유 ID"
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: "수정할 팁 제목"
   *                 example: "Updated Food Tips"
   *               content:
   *                 type: string
   *                 description: "수정할 팁 내용"
   *                 example: "Make sure to try different cuisines!"
   *               files:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: "업로드할 이미지 파일 (최대 5개)"
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
   *                       example: "Make sure to try different cuisines!"
   *                     imageUrls:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           media_url:
   *                             type: string
   *                             example: "https://s3.amazonaws.com/bucket-name/path/to/image.jpg"
   *                           media_type:
   *                             type: string
   *                             example: "image/png"
   */
  private async updateTip(req: Request & { files?: Express.Multer.File[] }, res: Response, next: NextFunction) {
    try {
      const { title, content } = req.body;
      const tipId = parseInt(req.params.tipId, 10);

      if (!title || !content) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          isSuccess: false,
          message: "제목과 내용을 입력해야 합니다.",
        });
      }

      let newImages = [];
      if (req.files && req.files.length > 0) {
        newImages = req.files.map((file) => ({
          media_url: file.location, // S3 업로드된 URL
          media_type: file.mimetype,
        }));
      }

      const updatedTip = await this.tipService.updateTip(tipId, title, content, newImages);

      res.status(StatusCodes.OK).json({
        isSuccess: true,
        message: "팁 수정 성공",
        result: updatedTip,
      });
    } catch (error) {
      next(error);
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
      const tipId = parseInt(req.params.tipId, 10); // 삭제할 팁 ID

      // 팁 삭제
      await this.tipService.deleteTip(tipId);
      res.status(StatusCodes.OK).json({
        isSuccess: true,
        code: 'COMMON200',
        message: 'Tip deleted successfully.',
      });
    } catch (error) {
      next(error); // 에러 처리
    }
  }

 /**
 * @swagger
 * /api/v1/tips:
 *   get:
 *     summary: "전체 꿀팁 조회 (페이지네이션 포함)"
 *     description: "전체 꿀팁을 조회합니다. 페이지네이션이 적용됩니다."
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
 *                             example: "Cleaning Hacks"
 *                           content:
 *                             type: string
 *                             example: "Efficient ways to clean your home."
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
 *                                 example: "https://example.com/john.jpg"
 *                           hashtags:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 hashtagId:
 *                                   type: integer
 *                                   example: 101
 *                                 name:
 *                                   type: string
 *                                   example: "cleaning"
 *                           imageUrls:  # ✅ 이미지 필드 추가
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 media_url:
 *                                   type: string
 *                                   example: "https://s3.amazonaws.com/bucket/path/image1.jpg"
 *                                 media_type:
 *                                   type: string
 *                                   example: "image/png"
 *                           createdAt:
 *                             type: string
 *                             example: "2023-01-01T00:00:00Z"
 *                           updatedAt:
 *                             type: string
 *                             example: "2023-01-02T00:00:00Z"
 */

 public async getAllTips(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const tips = await this.tipService.getAllTips(page, limit);
    res.status(StatusCodes.OK).json({
      isSuccess: true,
      message: '전체 팁 조회 성공',
      result: { tips },
    });
  } catch (error) {
    next(error);
  }
}

  /**
   * @swagger
   * /api/v1/tips/{tipId}:
   *   get:
   *     summary: "개별 팁 조회"
   *     description: "특정 팁의 상세 정보를 조회합니다."
   *     tags:
   *       - Tips
   *     parameters:
   *       - in: path
   *         name: tipId
   *         required: true
   *         description: "조회할 팁의 고유 ID"
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: "팁 상세 조회 성공"
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
   *                   example: "팁 상세 조회 성공"
   *                 result:
   *                   type: object
   *                   properties:
   *                     tipId:
   *                       type: integer
   *                       example: 1
   *                     title:
   *                       type: string
   *                       example: "Best Cleaning Tips"
   *                     content:
   *                       type: string
   *                       example: "These are some great cleaning tips!"
   *                     author:
   *                       type: object
   *                       properties:
   *                         userId:
   *                           type: integer
   *                           example: 1
   *                         nickname:
   *                           type: string
   *                           example: "John Doe"
   *                         profileImageUrl:
   *                           type: string
   *                           example: "https://example.com/john.jpg"
   *                     hashtags:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           hashtagId:
   *                             type: integer
   *                             example: 101
   *                           name:
   *                             type: string
   *                             example: "cleaning"
   *                     imageUrls:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           media_url:
   *                             type: string
   *                             example: "https://s3.amazonaws.com/bucket/path/image1.jpg"
   *                           media_type:
   *                             type: string
   *                             example: "image/png"
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2023-01-01T00:00:00Z"
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2023-01-02T00:00:00Z"
   *       404:
   *         description: "팁을 찾을 수 없음"
   */

public async getTipDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const tipId = parseInt(req.params.tipId, 10);
    if (isNaN(tipId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        isSuccess: false,
        message: '유효하지 않은 팁 ID입니다.',
      });
    }

    const tip = await this.tipService.getTipDetailsById(tipId);
    if (!tip) {
      return res.status(StatusCodes.NOT_FOUND).json({
        isSuccess: false,
        message: '해당 팁을 찾을 수 없습니다.',
      });
    }

    res.status(StatusCodes.OK).json({
      isSuccess: true,
      message: '팁 상세 조회 성공',
      result: tip,
    });
  } catch (error) {
    next(error);
  }
}



   /**
   * @swagger
   * /api/v1/tips/sorted:
   *   get:
   *     summary: "정렬된 꿀팁 조회 (페이지네이션 포함)"
   *     description: "정렬된 꿀팁을 조회합니다. 정렬 기준과 페이지네이션을 설정할 수 있습니다."
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
   *                             example: "Try different local cuisines."
   *                           author:
   *                             type: object
   *                             properties:
   *                               userId:
   *                                 type: integer
   *                                 example: 2
   *                               nickname:
   *                                 type: string
   *                                 example: "Jane Doe"
   *                               profileImageUrl:
   *                                 type: string
   *                                 example: "https://example.com/jane.jpg"
   *                           hashtags:
   *                             type: array
   *                             items:
   *                               type: object
   *                               properties:
   *                                 hashtagId:
   *                                   type: integer
   *                                   example: 102
   *                                 name:
   *                                   type: string
   *                                   example: "food"
   *                           imageUrls:
   *                             type: array
   *                             items:
   *                               type: object
   *                               properties:
   *                                 media_url:
   *                                   type: string
   *                                   example: "https://s3.amazonaws.com/bucket/path/image.jpg"
   *                                 media_type:
   *                                   type: string
   *                                   example: "image/png"
   *                           likesCount:
   *                             type: integer
   *                             example: 150
   *                           savesCount:
   *                             type: integer
   *                             example: 75
   *                           createdAt:
   *                             type: string
   *                             example: "2023-02-01T00:00:00Z"
   *                           updatedAt:
   *                             type: string
   *                             example: "2023-02-02T00:00:00Z"
   */
   public async getSortedTips(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sort = req.query.sort as string || 'latest';

      const tips = await this.tipService.getSortedTips(page, limit, sort);
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
          message: '검색어(query)는 필수입니다.',
        });
      }

      const tips = await this.tipService.searchTips(query, page, limit); // ✅ `this.tipService` 오류 방지

      res.status(StatusCodes.OK).json({
        isSuccess: true,
        message: '팁 검색 성공',
        result: tips,
      });
    } catch (error) {
      next(error);
    }
  }
}
