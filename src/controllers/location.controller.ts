import { Router, Request, Response } from 'express';
import { LocationService } from '../services/location.service.js';
import {
  LocationListResponseDto,
  LocationResponseDto,
} from '../dtos/location.dto.js';
import { StatusCodes } from 'http-status-codes';

export class LocationController {
  private locationService: LocationService;
  public router: Router;

  constructor() {
    this.locationService = new LocationService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /api/v1/locations:
     *   post:
     *     summary: "위치 생성"
     *     tags:
     *       - Location
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               location_name:
     *                 type: string
     *                 description: "지역 이름"
     *               parent_id:
     *                 type: integer
     *                 description: "상위 지역 ID"
     *     responses:
     *       200:
     *         description: "위치 조회 성공"
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
     *                     location_id:
     *                       type: integer
     *                       example: 1
     *                       description: "위치의 고유 ID"
     *                     name:
     *                       type: string
     *                       example: "서울"
     *                       description: "위치 이름"
     *                     parent:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: integer
     *                           example: 0
     *                           description: "부모 위치의 ID"
     *                         name:
     *                           type: string
     *                           example: "국가"
     *                           description: "부모 위치 이름"
     *       400:
     *         description: "잘못된 요청 (유효하지 않은 위치 ID)"
     *       404:
     *         description: "위치를 찾을 수 없음"
     *       500:
     *         description: "서버 내부 오류"
     */
    this.router.post('/api/v1/locations', this.createLocation.bind(this));

    /**
     * @swagger
     * /api/v1/locations:
     *   get:
     *     summary: "위치 리스트 조회"
     *     description: "모든 위치 정보를 조회합니다."
     *     tags:
     *       - Location
     *     responses:
     *       200:
     *         description: "위치 리스트 조회 성공"
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
     *                     location_list:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           location_id:
     *                             type: integer
     *                             example: 1
     *                             description: "위치의 고유 ID"
     *                           name:
     *                             type: string
     *                             example: "서울"
     *                             description: "위치 이름"
     *                           parent:
     *                             type: object
     *                             properties:
     *                               id:
     *                                 type: integer
     *                                 example: 0
     *                                 description: "부모 위치의 ID"
     *                               name:
     *                                 type: string
     *                                 example: "국가"
     *                                 description: "부모 위치 이름"
     *       500:
     *         description: "서버 내부 오류"
     */
    this.router.get('/api/v1/locations', this.getAllLocation.bind(this));
  }

  private async createLocation(req: Request, res: Response) {
    const location: string = req.body.location_name;
    const parent_id: number = +req.body.parent_id;

    const savedLocation = await this.locationService.createLocation(
      location,
      parent_id
    );

    const output: LocationResponseDto = {
      location_id: savedLocation.location_id,
      name: savedLocation.name,
      parent: {
        id:
          savedLocation.parent != null
            ? savedLocation.parent.location_id
            : null,
        name: savedLocation.parent != null ? savedLocation.parent.name : null,
      },
    };

    res.status(StatusCodes.OK).success(output);
  }

  private async getAllLocation(req: Request, res: Response) {
    const location_list = await this.locationService.getAll();

    const output: LocationListResponseDto = {
      location_list: location_list.map((location) => {
        return {
          location_id: location.location_id,
          name: location.name,
          parent: {
            id: location.parent != null ? location.parent.location_id : null,
            name: location.parent != null ? location.parent.name : null,
          },
        };
      }),
    };

    res.status(StatusCodes.OK).success(output);
  }
}
