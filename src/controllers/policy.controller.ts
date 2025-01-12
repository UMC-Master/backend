import { Router, Request, Response } from 'express';
import { PolicyGuideDto, PolicyListDto } from '../dtos/policy.dto.js';
import { StatusCodes } from 'http-status-codes';

export class PolicyController {
  private policyService: unknown;
  public router: Router;

  constructor() {
    this.policyService = null; // new PolicyService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /api/v1/policies:
     *   get:
     *     summary: "정책 리스트 조회"
     *     description: "특정 지역에 대한 정책 리스트를 조회합니다."
     *     tags:
     *       - Policy
     *     parameters:
     *       - in: query
     *         name: region
     *         required: true
     *         description: "정책을 조회할 지역 (예: '서울', '부산')"
     *         schema:
     *           type: string
     *           example: "서울"
     *     responses:
     *       200:
     *         description: "정책 리스트 조회 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 policyList:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       title:
     *                         type: string
     *                         description: "정책의 제목"
     *                       image:
     *                         type: string
     *                         description: "정책 관련 이미지 URL"
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.get('/api/v1/policies', this.getPolicies.bind(this));

    /**
     * @swagger
     * /api/v1/policies/{policyId}/guide:
     *   get:
     *     summary: "정책 안내 조회"
     *     description: "특정 정책에 대한 자세한 안내 정보를 조회합니다."
     *     tags:
     *       - Policy
     *     parameters:
     *       - in: path
     *         name: policyId
     *         required: true
     *         description: "정책 ID (정책에 대한 고유 식별자)"
     *         schema:
     *           type: integer
     *           example: 1
     *     responses:
     *       200:
     *         description: "정책 안내 조회 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 policyId:
     *                   type: integer
     *                   example: 1
     *                   description: "정책의 고유 ID"
     *                 description:
     *                   type: string
     *                   example: "이 정책은 특정 지역의 환경 보호를 위한 정책입니다."
     *                   description: "정책에 대한 설명"
     *                 imageUrlList:
     *                   type: array
     *                   items:
     *                     type: string
     *                     example: "https://example.com/guide-image.png"
     *                   description: "정책에 관련된 이미지 URL 리스트"
     *       400:
     *         description: "잘못된 요청"
     *       500:
     *         description: "서버 내부 오류"
     */
    this.router.get(
      '/api/vi/policies/:policeId/guide',
      this.getPolicyGuide.bind(this)
    );
  }

  private async getPolicies(req: Request, res: Response) {
    const region: PolicyListDto = null;
    res.status(StatusCodes.OK).json(region);
  }

  private async getPolicyGuide(req: Request, res: Response) {
    const guide: PolicyGuideDto = null;
    res.status(StatusCodes.OK).json(guide);
  }
}
