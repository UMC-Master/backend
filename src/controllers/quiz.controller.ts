import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { QuizListDto } from '../dtos/quiz.dto.js';
import 'express-async-errors';

export class QuizController {
  private quizService: unknown; // 이후 QuizService로 설정;
  public router: Router;

  constructor() {
    this.quizService = null;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /api/v1/quizzes:
     *   get:
     *     summary: "퀴즈 리스트 랜덤 조회"
     *     description: "자취 지식 테스트를 위한 퀴즈 리스트 조회"
     *     tags:
     *       - Quiz
     *     responses:
     *       200:
     *         description: "퀴즈 리스트 조회 성공"
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
     *                     number_of_quiz:
     *                       type: integer
     *                       example: 5
     *                       description: "퀴즈의 총 개수"
     *                     quiz_list:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           quiz_id:
     *                             type: integer
     *                             example: 1
     *                             description: "퀴즈의 고유 ID"
     *                           description:
     *                             type: string
     *                             example: "이 문제의 정답은 무엇일까요?"
     *                             description: "퀴즈 문제 설명"
     *                           answer:
     *                             type: boolean
     *                             example: true
     *                             description: "퀴즈 문제에 대한 정답 (true/false)"
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.get('/api/v1/quizzes', this.getQuizzes.bind(this));

    /**
     * @swagger
     * /api/v1/quizzes/{quizId}:
     *   post:
     *     summary: "퀴즈 정답 로그 기록"
     *     description: "사용자가 퀴즈를 풀었을 때, 정답 여부를 기록합니다."
     *     tags:
     *       - Quiz
     *     parameters:
     *       - in: path
     *         name: quizId
     *         required: true
     *         description: "퀴즈의 고유 ID"
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
     *               isCorrect:
     *                 type: boolean
     *                 example: true
     *                 description: "사용자가 퀴즈의 정답을 맞췄는지 여부 (true/false)"
     *     responses:
     *       200:
     *         description: "정답 기록 성공"
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
     *                     message:
     *                       type: string
     *                       example: "퀴즈 기록이 저장되었습니다."
     *       400:
     *         description: "잘못된 요청 (파라미터 오류 또는 본문 누락)"
     *       401:
     *         description: "인증 실패 (토큰이 없거나 유효하지 않음)"
     */
    this.router.post(
      '/api/v1/quizzes/:quizId',
      this.saveQuizAnswerHistory.bind(this)
    );
  }

  private async getQuizzes(req: Request, res: Response) {
    const data: QuizListDto = null;
    res.status(StatusCodes.OK).success({
      number_of_quiz: 5,
      quiz_list: [
        {
          quiz_id: 1,
          description: '사자는 동물이다?',
          answer: true,
        },
        {
          quiz_id: 2,
          description: '사자는 개미다?',
          answer: false,
        },
        {
          quiz_id: 3,
          description: '사자는 포유류다?',
          answer: true,
        },
        {
          quiz_id: 4,
          description: '사자는 고양이다?',
          answer: false,
        },
        {
          quiz_id: 5,
          description: '사자는 사자다?',
          answer: true,
        },
      ],
    });
  }

  private async saveQuizAnswerHistory(req: Request, res: Response) {
    res
      .status(StatusCodes.OK)
      .success({ message: '퀴즈 기록이 저장되었습니다.' });
  }
}
