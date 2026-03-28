import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ChallengeService } from '../services/challenge.service.js';
import 'express-async-errors';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';

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
     *                 challengeId:
     *                   type: integer
     *                 imageUrl:
     *                   type: string
     *                 title:
     *                   type: string
     *                 startDate:
     *                   type: string
     *                   format: date-time
     *                 endDate:
     *                   type: string
     *                   format: date-time
     *                 descriptionTitle:
     *                   type: string
     *                 descriptionContent:
     *                   type: string
     *                 verificationMethod:
     *                   type: string
     *                 likesCount:
     *                   type: integer
     *                 bookmarksCount:
     *                   type: integer
     *                 sharesCount:
     *                   type: integer
     *                 hashtags:
     *                   type: array
     *                   items:
     *                     type: string
     */
    this.router.get('/challenges', this.getOngoingChallenge.bind(this));

    /**
     * @swagger
     * /api/v1/challenges/{id}/start:
     *   post:
     *     summary: "챌린지 시작"
     *     description: "챌린지 시작 - 챌린지 시도 테이블에 인스턴스 생성"
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
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       201:
     *         description: "챌린지 시작 성공"
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
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       201:
     *         description: "챌린지 인증 성공"
     */
    this.router.post(
      '/challenges/:id/verify',
      authenticateJWT,
      this.verifyChallengeAttempt.bind(this)
    );

    /**
     * @swagger
     * /api/v1/challenges/{id}/stop:
     *   patch:
     *     summary: "챌린지 중단"
     *     description: "챌린지 중단 - 챌린지 시도 테이블 상태 변경"
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
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       200:
     *         description: "챌린지 중단 성공"
     */
    this.router.patch(
      '/challenges/:id/stop',
      authenticateJWT,
      this.stopChallenge.bind(this)
    );
  }

  private async getOngoingChallenge(req: Request, res: Response) {
    const challenge = await this.challengeService.getOngoingChallenge();
    res.status(StatusCodes.OK).json(challenge);
  }

  private async getChallenge(req: Request, res: Response) {
    const challenge_id = parseInt(req.params.id);
    const challenge =
      await this.challengeService.getChallengeById(challenge_id);
    res.status(StatusCodes.OK).json(challenge);
  }

  private async startChallenge(req: Request, res: Response) {
    const challenge_id = parseInt(req.params.id);
    const user_id = req.user.userId;

    const attemptData = {
      challenge_id,
      user_id,
      status: 'started',
      ...req.body,
    };

    const result = await this.challengeService.startChallenge(attemptData);
    res.status(StatusCodes.CREATED).json(result);
  }

  private async verifyChallengeAttempt(req: Request, res: Response) {
    const attempt_id = parseInt(req.params.id);

    const verificationData = {
      attempt_id,
      status: 'pending',
      images: req.body.images || [],
      ...req.body,
    };

    const result =
      await this.challengeService.verifyChallengeAttempt(verificationData);
    res.status(StatusCodes.CREATED).json(result);
  }

  private async stopChallenge(req: Request, res: Response) {
    const attempt_id = parseInt(req.params.id);

    const stopData = {
      attempt_id,
      status: 'stopped',
      ...req.body,
    };

    const result = await this.challengeService.stopChallenge(stopData);
    res.status(StatusCodes.OK).json(result);
  }
}
