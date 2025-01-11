import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { QuizListDto } from '../dtos/quiz.dto.js';

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
     *                 numberOfQuiz:
     *                   type: integer
     *                   example: 5
     *                   description: "퀴즈의 총 개수"
     *                 QuizList:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       description:
     *                         type: string
     *                         example: "이 문제의 정답은 무엇일까요?"
     *                         description: "퀴즈 문제 설명"
     *                       answer:
     *                         type: boolean
     *                         example: true
     *                         description: "퀴즈 문제에 대한 정답 (true/false)"
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.get('/api/v1/quizzes', this.getQuizzes.bind(this));
  }

  private async getQuizzes(req: Request, res: Response) {
    try {
      const data: QuizListDto = null;
      res.status(StatusCodes.OK).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}
