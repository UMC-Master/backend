import { Router, Request, Response } from 'express';
import { OrganizationService } from '../services/organization.service.js';
import {
  OrganizationListResponseDto,
  OrganizationResponseDto,
} from '../dtos/organization.dto.js';
import { StatusCodes } from 'http-status-codes';

export class OrganizationController {
  private organizationService: OrganizationService;
  public router: Router;

  constructor() {
    this.organizationService = new OrganizationService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /api/v1/organizations:
     *   post:
     *     summary: "기관 생성"
     *     tags:
     *       - Organization
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               organization_name:
     *                 type: string
     *                 description: "기관 이름"
     *               location_id:
     *                 type: integer
     *                 description: "지역 ID"
     *     responses:
     *       200:
     *         description: "기관 생성성 성공"
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
     *                     organization_id:
     *                       type: integer
     *                       example: 1
     *                       description: "기관의 고유 ID"
     *                     name:
     *                       type: string
     *                       example: "영등포구청청"
     *                       description: "기관 이름"
     *                     location:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: integer
     *                           example: 1
     *                           description: "위치의 ID"
     *                         name:
     *                           type: string
     *                           example: "영등포"
     *                           description: "위치 이름"
     *       400:
     *         description: "잘못된 요청 (유효하지 않은 위치 ID)"
     *       404:
     *         description: "위치를 찾을 수 없음"
     *       500:
     *         description: "서버 내부 오류"
     */
    this.router.post(
      '/organizations',
      this.createOrganization.bind(this)
    );

    /**
     * @swagger
     * /api/v1/organizations:
     *   get:
     *     summary: "기관 리스트 조회"
     *     description: "모든 기관 정보를 조회합니다."
     *     tags:
     *       - Organization
     *     responses:
     *       200:
     *         description: "기관 리스트 조회 성공"
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
     *                     organization_list:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           organization_id:
     *                             type: integer
     *                             example: 1
     *                             description: "기관의 고유 ID"
     *                           name:
     *                             type: string
     *                             example: "영등포구청"
     *                             description: "기관 이름"
     *                           location:
     *                             type: object
     *                             properties:
     *                               id:
     *                                 type: integer
     *                                 example: 1
     *                                 description: "위치의 ID"
     *                               name:
     *                                 type: string
     *                                 example: "영등포"
     *                                 description: "위치 이름"
     *       500:
     *         description: "서버 내부 오류"
     */
    this.router.get(
      '/organizations',
      this.getAllOrganization.bind(this)
    );
  }

  private async createOrganization(req: Request, res: Response) {
    const organization: string = req.body.organization_name;
    const location_id: number = +req.body.location_id;

    const savedOrganization = await this.organizationService.createOrganization(
      organization,
      location_id
    );

    const output: OrganizationResponseDto = {
      organization_id: savedOrganization.organization_id,
      name: savedOrganization.name,
      location: {
        id:
          savedOrganization.location != null
            ? savedOrganization.location.location_id
            : null,
        name:
          savedOrganization.location != null
            ? savedOrganization.location.name
            : null,
      },
    };

    res.status(StatusCodes.OK).success(output);
  }

  private async getAllOrganization(req: Request, res: Response) {
    const organization_list = await this.organizationService.getAll();

    const output: OrganizationListResponseDto = {
      organization_list: organization_list.map((organization) => {
        return {
          organization_id: organization.organization_id,
          name: organization.name,
          location: {
            id:
              organization.location != null
                ? organization.location.location_id
                : null,
            name:
              organization.location != null ? organization.location.name : null,
          },
        };
      }),
    };

    res.status(StatusCodes.OK).success(output);
  }
}
