import { Router, Request, Response } from 'express';

// TipController: 꿀팁 기능을 처리하는 컨트롤러 (계절별 분류, 카테고리별 브라우징, 검색 기능)
export class TipController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.getTipsBySeason();
    this.browseTipsByCategory();
    this.searchTips();
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
}
