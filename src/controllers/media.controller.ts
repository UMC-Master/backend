// media.controller.ts
import { Router, Request, Response } from 'express';
import 'express-async-errors';

export class MediaController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Swagger 문서화
    /**
     * @swagger
     * /api/v1/tips/{tipId}/media/play:
     *   get:
     *     summary: "멀티미디어 콘텐츠 재생"
     *     description: "주어진 tip ID에 대한 멀티미디어 콘텐츠를 조회하여 재생합니다."
     *     tags:
     *       - Medias
     *     operationId: playMedia
     *     parameters:
     *       - in: path
     *         name: tipId
     *         required: true
     *         schema:
     *           type: integer
     *         description: "재생할 미디어가 포함된 꿀팁의 ID."
     *     responses:
     *       '200':
     *         description: "미디어 콘텐츠를 성공적으로 조회"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 media_url:
     *                   type: string
     *                   description: "미디어 콘텐츠의 URL."
     *                 media_type:
     *                   type: string
     *                   description: "미디어 타입 (예: 이미지, 비디오)."
     *       '404':
     *         description: "해당 꿀팁을 찾을 수 없음"
     *       '500':
     *         description: "서버 내부 오류"
     */
    this.router.get('/tips/:tipId/media/play', this.playMedia);
    // Swagger 문서화
    /**
     * @swagger
     * /api/v1/tips/{tipId}/media/upload:
     *   post:
     *     summary: "멀티미디어 콘텐츠 업로드"
     *     description: "주어진 tip ID에 대한 멀티미디어 콘텐츠를 업로드합니다."
     *     tags:
     *       - Medias
     *     operationId: uploadMedia
     *     parameters:
     *       - in: path
     *         name: tipId
     *         required: true
     *         schema:
     *           type: integer
     *         description: "미디어를 업로드할 꿀팁의 ID."
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               media:
     *                 type: string
     *                 format: binary
     *                 description: "업로드할 미디어 파일."
     *     responses:
     *       '201':
     *         description: "미디어 콘텐츠 업로드 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 media_url:
     *                   type: string
     *                   description: "업로드된 미디어의 URL."
     *                 media_type:
     *                   type: string
     *                   description: "업로드된 미디어의 타입 (예: 이미지, 비디오)."
     *       '400':
     *         description: "잘못된 미디어 파일 형식"
     *       '404':
     *         description: "해당 꿀팁을 찾을 수 없음"
     *       '500':
     *         description: "서버 내부 오류"
     */
    this.router.post('/tips/:tipId/media/upload', this.uploadMedia);
  }

  // 멀티미디어 재생
  private playMedia(req: Request, res: Response) {
    const { tipId } = req.params;
    res.status(200).json({
      media_url: `https://example.com/media/${tipId}`,
      media_type: 'video',
    });
  }

  // 멀티미디어 업로드
  private uploadMedia(req: Request, res: Response) {
    const { tipId } = req.params;
    res.status(201).json({
      media_url: `https://example.com/media/${tipId}/uploaded-media`,
      media_type: 'image',
    });
  }
}
