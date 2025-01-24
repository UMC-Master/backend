import { Router, Request, Response } from 'express';
import {
  PolicyListDto,
  policyRequestDto,
  policyResponseDto,
} from '../dtos/policy.dto.js';
import { StatusCodes } from 'http-status-codes';
import { PolicyService } from '../services/policy.service.js';

export class PolicyController {
  private policyService: PolicyService;
  public router: Router;

  constructor() {
    this.policyService = new PolicyService();
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
     *         name: region_id
     *         required: true
     *         description: "정책을 조회할 지역의 ID"
     *         schema:
     *           type: number
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
      '/api/v1/policies/:policyId/guide',
      this.getPolicyGuide.bind(this)
    );

    /**
     * @swagger
     * /api/v1/policies:
     *   post:
     *     summary: "새 정책 생성"
     *     description: "새로운 정책을 생성합니다."
     *     tags:
     *       - Policy
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               organization_id:
     *                 type: integer
     *                 description: "조직 ID"
     *               title:
     *                 type: string
     *                 description: "정책 제목"
     *               description:
     *                 type: string
     *                 description: "정책 설명"
     *               policy_url:
     *                 type: string
     *                 description: "정책 URL"
     *               location_id:
     *                 type: integer
     *                 description: "위치 ID"
     *               iamge_url_list:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: "정책과 관련된 이미지 URL 리스트 (옵션)"
     *               magazine_hashtag_list:
     *                 type: array
     *                 items:
     *                   type: integer
     *                 description: "정책과 관련된 해시태그 목록 (숫자 ID 리스트)"
     *           example:
     *             organization_id: 1
     *             title: "환경 보호 정책"
     *             description: "지구 환경 보호를 위한 정책"
     *             policy_url: "https://example.com/policy"
     *             location_id: 101
     *             iamge_url_list: ["https://example.com/image1.png", "https://example.com/image2.png"]
     *             magazine_hashtag_list: [101, 102, 103]
     *     responses:
     *       200:
     *         description: "정책 생성 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   example: 123
     *                   description: "생성된 정책의 ID"
     *                 title:
     *                   type: string
     *                   example: "환경 보호 정책"
     *                   description: "정책 제목"
     *                 description:
     *                   type: string
     *                   example: "지구 환경 보호를 위한 정책"
     *                   description: "정책 설명"
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *                   example: "2025-01-19T12:00:00Z"
     *                   description: "정책 생성 시간"
     *                 updated_at:
     *                   type: string
     *                   format: date-time
     *                   example: "2025-01-19T12:00:00Z"
     *                   description: "정책 수정 시간"
     *                 policy_url:
     *                   type: string
     *                   example: "https://example.com/policy"
     *                   description: "정책 URL"
     *                 magazine_image_url_list:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       image_name:
     *                         type: string
     *                         example: "policy-image.jpg"
     *                         description: "이미지 파일 이름"
     *                       image_url:
     *                         type: string
     *                         example: "https://example.com/policy-image.jpg"
     *                         description: "이미지 URL"
     *                   description: "정책과 관련된 이미지 리스트 (옵션)"
     *                 magazine_likes:
     *                   type: integer
     *                   example: 10
     *                   description: "정책 좋아요 수"
     *                 magazine_bookmarks:
     *                   type: integer
     *                   example: 5
     *                   description: "정책 북마크 수"
     *                 organization:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 1
     *                       description: "조직 ID"
     *                     name:
     *                       type: string
     *                       example: "환경 보호 재단"
     *                       description: "조직 이름"
     *                 location:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 101
     *                       description: "위치 ID"
     *                     name:
     *                       type: string
     *                       example: "서울"
     *                       description: "위치 이름"
     *                 hashtag:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: integer
     *                         example: 101
     *                         description: "해시태그 ID"
     *                       name:
     *                         type: string
     *                         example: "#환경"
     *                         description: "해시태그 이름"
     *                   description: "정책과 관련된 해시태그 목록"
     *       400:
     *         description: "잘못된 요청"
     *       500:
     *         description: "서버 내부 오류"
     */
    this.router.post('/api/v1/policies', this.createPolicy.bind(this));

    /**
     * @swagger
     * /api/v1/policies/{policyId}:
     *   delete:
     *     summary: "정책 삭제"
     *     description: "특정 정책 ID를 기반으로 정책을 삭제합니다."
     *     tags:
     *       - Policy
     *     parameters:
     *       - in: path
     *         name: policyId
     *         required: true
     *         description: "삭제할 정책의 고유 ID"
     *         schema:
     *           type: integer
     *           example: 1
     *     responses:
     *       200:
     *         description: "정책 삭제 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 answer:
     *                   type: string
     *                   example: "성공적으로 삭제되었습니다!"
     *                   description: "성공 메시지"
     *       400:
     *         description: "잘못된 요청 (유효하지 않은 정책 ID)"
     *       404:
     *         description: "정책을 찾을 수 없음"
     *       500:
     *         description: "서버 내부 오류"
     */
    this.router.delete(
      '/api/v1/policies/:policyId',
      this.deletePolicy.bind(this)
    );
  }

  private async getPolicies(req: Request, res: Response) {
    const region_id: number = +req.query.region_id;
    const policy_list =
      await this.policyService.getPolicyListByLocation(region_id);
    const output: PolicyListDto = {
      policy_list: policy_list.map((policy) => ({
        id: policy.magazine_id,
        title: policy.title,
        imageUrl:
          policy.magazine_images[0] != null
            ? policy.magazine_images[0].image_url
            : '',
      })),
    };

    res.status(StatusCodes.OK).json(output);
  }

  private async getPolicyGuide(req: Request, res: Response) {
    const policy = await this.policyService.getPolicy(+req.params.policyId);

    const output: policyResponseDto = {
      id: policy.magazine_id,
      title: policy.title,
      description: policy.description,
      created_at: policy.created_at,
      updated_at: policy.updated_at,
      policy_url: policy.policy_url,
      magazine_likes: policy.magazine_likes,
      magazine_bookmarks: policy.magazine_bookmarks,
      organization: {
        id: policy.organization.organization_id,
        name: policy.organization.name,
      },
      location: {
        id: policy.location.location_id,
        name: policy.location.name,
      },
      hashtag: policy.hashtag_list,
    };

    res.status(StatusCodes.OK).json(output);
  }

  private async createPolicy(req: Request, res: Response) {
    const input: policyRequestDto = {
      organization_id: req.body.organization_id,
      title: req.body.title,
      description: req.body.description,
      policy_url: req.body.policy_url,
      location_id: req.body.location_id,
      magazine_hashtag_id_list: req.body.magazine_hashtag_list,
    };

    const policy = await this.policyService.createPolicy(input);

    const output: policyResponseDto = {
      id: policy.magazine_id,
      title: policy.title,
      description: policy.description,
      created_at: policy.created_at,
      updated_at: policy.updated_at,
      policy_url: policy.policy_url,
      magazine_likes: policy.magazine_likes,
      magazine_bookmarks: policy.magazine_bookmarks,
      organization: {
        id: policy.organization.organization_id,
        name: policy.organization.name,
      },
      location: {
        id: policy.location.location_id,
        name: policy.location.name,
      },
      hashtag: policy.hashtag_list,
    };

    res.status(StatusCodes.OK).json(output);
  }

  private async deletePolicy(req: Request, res: Response) {
    const policy_id: number = +req.params.policyId;

    await this.policyService.deletePolicy(policy_id);

    res.status(StatusCodes.OK).json({ answer: '성공적으로 삭제되었습니다!' });
  }
}
