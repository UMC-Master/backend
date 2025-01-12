import { Router, Request, Response } from 'express';
import { TipDto } from '../dtos/tip.dto.js';
import { StatusCodes } from 'http-status-codes';

// TipController: 꿀팁 기능을 처리하는 컨트롤러 (계절별 분류, 카테고리별 브라우징, 검색 기능)
export class TipController {
  public tipService: unknown; //TipService
  public router: Router;

  constructor() {
    this.tipService = null; // new TipService();
    this.router = Router();
    this.getTipsBySeason();
    this.browseTipsByCategory();
    this.searchTips();
    this.initializeRoutes();
  }

  private initializeRoutes() {
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
     *                 description: "팁의 제목"
     *               imageUrlList:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: uri
     *                 description: "팁에 관련된 이미지 URL 리스트"
     *               description:
     *                 type: string
     *                 description: "팁에 대한 설명"
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
     *                   description: "팁의 고유 ID"
     *                 title:
     *                   type: string
     *                   description: "팁의 제목"
     *                 imageUrlList:
     *                   type: array
     *                   items:
     *                     type: string
     *                     example: "https://example.com/tip-image.png"
     *                   description: "팁에 관련된 이미지 URL 리스트"
     *                 description:
     *                   type: string
     *                   description: "팁에 대한 설명"
     *                 authorId:
     *                   type: integer
     *                   example: 123
     *                   description: "팁 작성자의 고유 ID"
     *                 valid:
     *                   type: boolean
     *                   example: true
     *                   description: "팁이 유효한지 여부"
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.post('/api/v1/tips', this.createTip.bind(this));

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
     *                 description: "팁의 제목"
     *               imageUrlList:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: uri
     *                 description: "팁에 관련된 이미지 URL 리스트"
     *               description:
     *                 type: string
     *                 description: "팁에 대한 설명"
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
     *                   description: "수정된 팁의 고유 ID"
     *                 title:
     *                   type: string
     *                   description: "수정된 팁의 제목"
     *                 imageUrlList:
     *                   type: array
     *                   items:
     *                     type: string
     *                     example: "https://example.com/tip-image.png"
     *                   description: "수정된 팁에 관련된 이미지 URL 리스트"
     *                 description:
     *                   type: string
     *                   description: "수정된 팁에 대한 설명"
     *                 authorId:
     *                   type: integer
     *                   example: 123
     *                   description: "팁 작성자의 고유 ID"
     *                 valid:
     *                   type: boolean
     *                   example: true
     *                   description: "팁이 유효한지 여부"
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.put('/api/v1/tips/:tipId', this.updateTip.bind(this));

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
     *         description: "새로운 팁 삭제 성공"
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.delete('/api/v1/tips/:tipId', this.deleteTip.bind(this));

    /**
     * @swagger
     * /api/v1/tips/{tipId}/disable:
     *   put:
     *     summary: "팁 비활성화"
     *     description: "특정 팁을 비활성화하여 시스템에서 더 이상 사용되지 않도록 합니다."
     *     tags:
     *       - Tips
     *     parameters:
     *       - in: path
     *         name: tipId
     *         required: true
     *         description: "비활성화할 팁의 고유 ID"
     *         schema:
     *           type: integer
     *           example: 1
     *     responses:
     *       200:
     *         description: "팁 비활성화 성공"
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.put(
      '/api/v1/tips/:tipId/disable',
      this.filteringTip.bind(this)
    );
  }

  private getTipsBySeason() {
    /**
     * @swagger
     * /api/v1/tips:
     *   get:
     *     summary: 계절별 꿀팁 가져오기
     *     description: 특정 계절에 해당하는 꿀팁을 조회합니다.
     *     tags:
     *       - Tips
     *     parameters:
     *       - name: season
     *         in: query
     *         description: 필터링할 계절
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: 꿀팁 목록 조회 성공
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
     *                     tips:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: integer
     *                             example: 1
     *                           title:
     *                             type: string
     *                             example: "5 Summer Tips"
     *                           content:
     *                             type: string
     *                             example: "Stay hydrated and wear sunscreen."
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
     *                       example: "Missing 'season' query parameter"
     */

    this.router.get('/api/v1/tips', (req: Request, res: Response) => {
      res.status(200).send(); // 빈 응답
    });
  }

  private browseTipsByCategory() {
    /**
     * @swagger
     * /api/v1/tips/category:
     *   get:
     *     summary: 카테고리별 꿀팁 탐색
     *     description: 특정 카테고리에 해당하는 꿀팁을 조회합니다.
     *     tags:
     *       - Tips
     *     parameters:
     *       - name: category
     *         in: query
     *         description: 필터링할 카테고리
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: 꿀팁 목록 조회 성공
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
     *                     tips:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: integer
     *                             example: 1
     *                           title:
     *                             type: string
     *                             example: "Best Food Tips"
     *                           content:
     *                             type: string
     *                             example: "Try local cuisine when traveling."
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
     *                       example: "Missing 'category' query parameter"
     */
    this.router.get('/api/v1/tips/category', (req: Request, res: Response) => {
      res.status(200).send(); // 빈 응답
    });
  }

  private searchTips() {
    /**
     * @swagger
     * /api/v1/tips/search:
     *   get:
     *     summary: 키워드로 꿀팁 검색
     *     description: 특정 키워드와 일치하는 꿀팁을 검색합니다.
     *     tags:
     *       - Tips
     *     parameters:
     *       - name: keyword
     *         in: query
     *         description: 검색할 키워드
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: 꿀팁 목록 조회 성공
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
     *                     tips:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: integer
     *                             example: 1
     *                           title:
     *                             type: string
     *                             example: "Travel Tips"
     *                           content:
     *                             type: string
     *                             example: "Pack light for shorter trips."
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
     *                       example: "Missing 'keyword' query parameter"
     */

    this.router.get('/api/v1/tips/search', (req: Request, res: Response) => {
      res.status(200).send(); // 빈 응답
    });
  }

  private async createTip(req: Request, res: Response) {
    const data: TipDto = req.body;
    res.status(StatusCodes.OK).json(data);
  }

  private async updateTip(req: Request, res: Response) {
    const data: TipDto = req.body;
    res.status(StatusCodes.OK).json(data);
  }

  private async deleteTip(req: Request, res: Response) {
    const data: TipDto = req.body;
    res.status(StatusCodes.OK).json(data);
  }

  private async filteringTip(req: Request, res: Response) {
    const data: TipDto = req.body;
    res.status(StatusCodes.OK).json(data);
  }
}
