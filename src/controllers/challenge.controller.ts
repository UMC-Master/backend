import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ChallengeService } from '../services/challenge.service.js';
import 'express-async-errors';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { imageUploader } from '../file.uploader.js';

export class ChallengeController {
  private challengeService: ChallengeService;
  public router: Router;

  constructor() {
    this.challengeService = new ChallengeService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /api/v1/challenges:
     *   get:
     *     summary: "진행중인 챌린지 조회"
     *     description: "현재 진행중인 챌린지 1건 조회"
     *     tags:
     *       - Challenge
     *     responses:
     *       200:
     *         description: "챌린지 조회 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isSuccess:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: string
     *                   example: "COMMON200"
     *                 message:
     *                   type: string
     *                   example: "성공입니다."
     *                 result:
     *                   type: object
     *                   properties:
     *                     challengeId:
     *                       type: integer
     *                     imageUrl:
     *                       type: string
     *                     title:
     *                       type: string
     *                     startDate:
     *                       type: string
     *                       format: date-time
     *                     endDate:
     *                       type: string
     *                       format: date-time
     *                     descriptionTitle:
     *                       type: string
     *                     descriptionContent:
     *                       type: string
     *                     verificationMethod:
     *                       type: string
     *                     likesCount:
     *                       type: integer
     *                     bookmarksCount:
     *                       type: integer
     *                     sharesCount:
     *                       type: integer
     *                     hashtags:
     *                       type: array
     *                       items:
     *                         type: string
     */
    this.router.get('/challenges', this.getOngoingChallenge.bind(this));

    /**
     * @swagger
     * /api/v1/challenges/{id}/start:
     *   post:
     *     summary: "챌린지 시작"
     *     description: "로그인한 사용자가 챌린지를 시작합니다. challenge_attempt 테이블에 status=START로 생성됩니다."
     *     tags:
     *       - Challenge
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       201:
     *         description: "챌린지 시작 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isSuccess:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: string
     *                   example: "COMMON200"
     *                 message:
     *                   type: string
     *                   example: "성공입니다."
     *                 result:
     *                   type: object
     *                   properties:
     *                     attempt_id:
     *                       type: integer
     *                       example: 12
     *                     challenge_id:
     *                       type: integer
     *                       example: 1
     *                     user_id:
     *                       type: integer
     *                       example: 25
     *                     status:
     *                       type: string
     *                       example: "START"
     *       400:
     *         description: "이미 시작한 챌린지"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isSuccess:
     *                   type: boolean
     *                   example: false
     *                 code:
     *                   type: string
     *                   example: "CH002"
     *                 message:
     *                   type: string
     *                   example: "이미 시작한 챌린지입니다."
     *                 data:
     *                   type: object
     *                   properties:
     *                     challenge_id:
     *                       type: integer
     *                       example: 1
     *                     user_id:
     *                       type: integer
     *                       example: 25
     *                     attempt_id:
     *                       type: integer
     *                       example: 12
     *       401:
     *         description: "인증 실패"
     */
    this.router.post(
      '/challenges/:id/start',
      authenticateJWT,
      this.startChallenge.bind(this)
    );

    /**
     * @swagger
     * /api/v1/challenges/{id}/verify:
     *   post:
     *     summary: "챌린지 인증"
     *     description: "챌린지 인증 - 챌린지 인증 테이블 및 인증 이미지 테이블 인스턴스 생성"
     *     tags:
     *       - Challenge
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               image_list:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *                 description: "인증 이미지 파일 리스트"
     *     responses:
     *       201:
     *         description: "챌린지 인증 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isSuccess:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: string
     *                   example: "COMMON200"
     *                 message:
     *                   type: string
     *                   example: "성공입니다."
     *                 result:
     *                   type: object
     *                   description: "챌린지 인증 결과"
     */
    this.router.post(
      '/challenges/:id/verify',
      authenticateJWT,
      imageUploader.array('image_list', 5),
      this.verifyChallengeAttempt.bind(this)
    );

    /**
     * @swagger
     * /api/v1/challenges/{id}/stop:
     *   patch:
     *     summary: "챌린지 중단"
     *     description: "챌린지 중단 - 챌린지 시도 테이블 상태를 CANCELED로 변경"
     *     tags:
     *       - Challenge
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: "챌린지 중단 성공"
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isSuccess:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: string
     *                   example: "COMMON200"
     *                 message:
     *                   type: string
     *                   example: "성공입니다."
     *                 result:
     *                   type: object
     *                   description: "챌린지 중단 결과"
     */
    this.router.patch(
      '/challenges/:id/stop',
      authenticateJWT,
      this.stopChallenge.bind(this)
    );
  }

  private async getOngoingChallenge(req: Request, res: Response) {
    const challenge = await this.challengeService.getOngoingChallenge();
    res.status(StatusCodes.OK).success(challenge);
  }

  private async getChallenge(req: Request, res: Response) {
    const challenge_id = parseInt(req.params.id);
    const challenge =
      await this.challengeService.getChallengeById(challenge_id);
    res.status(StatusCodes.OK).success(challenge);
  }

  private async startChallenge(req: Request, res: Response) {
    const challenge_id = parseInt(req.params.id);
    const user_id = req.user.userId;

    const attemptData = {
      challenge_id,
      user_id,
    };

    const result = await this.challengeService.startChallenge(attemptData);
    res.status(StatusCodes.CREATED).success(result);
  }

  private async verifyChallengeAttempt(req: Request, res: Response) {
    const attempt_id = parseInt(req.params.id);
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const imageUrls = files.map(
      (file) => (file as Express.Multer.File & { location: string }).location
    );

    const verificationData = {
      attempt_id,
      status: 'PENDING',
      images: imageUrls,
    };

    const result =
      await this.challengeService.verifyChallengeAttempt(verificationData);
    res.status(StatusCodes.CREATED).success(result);
  }

  private async stopChallenge(req: Request, res: Response) {
    const attempt_id = parseInt(req.params.id);

    const stopData = {
      attempt_id,
    };

    const result = await this.challengeService.stopChallenge(stopData);
    res.status(StatusCodes.OK).success(result);
  }
}
