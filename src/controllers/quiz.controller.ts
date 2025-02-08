import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { QuizDto, QuizListDto } from '../dtos/quiz.dto.js';
import 'express-async-errors';
import { QuizService } from '../services/quiz.service.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { CommonError } from '../errors/errors.js';

export class QuizController {
  private quizService: QuizService;
  public router: Router;

  constructor() {
    this.quizService = new QuizService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /api/v1/quizzes:
     *   post:
     *     summary: "퀴즈 생성"
     *     description: "자취 지식 테스트를 위한 새로운 퀴즈 생성"
     *     tags:
     *       - Quiz
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               question:
     *                 type: string
     *                 example: "플라스틱 빨대는 일반쓰레기로 버려야 한다?"
     *                 description: "퀴즈 내용"
     *               answer:
     *                 type: boolean
     *                 example: true
     *                 description: "true"
     *               description:
     *                 type: string
     *                 example: "빨대는 재활용하기에 너무 작아서 일반쓰레기로 버려야 합니다."
     *                 description: "퀴즈 정답에 대한 설명"
     *     responses:
     *       201:
     *         description: "퀴즈 생성 성공"
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
     *                     quiz_id:
     *                       type: integer
     *                       example: 1
     *                       description: "퀴즈의 고유 ID"
     *                     question:
     *                       type: string
     *                       example: "플라스틱 빨대는 일반쓰레기로 버려야 한다?"
     *                       description: "퀴즈"
     *                     answer:
     *                       type: boolean
     *                       example: true
     *                       description: "퀴즈 문제에 대한 정답 (true/false)"
     *                     description:
     *                       type: string
     *                       example: "빨대는 재활용하기에 너무 작아서 일반쓰레기로 버려야 합니다."
     *                       description: "퀴즈 정답 설명"
     *       400:
     *         description: "잘못된 요청 (필수 입력 값 누락 등)"
     *       500:
     *         description: "서버 오류"
     */
    this.router.post('/quizzes', authenticateJWT, this.createQuiz.bind(this));

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
     *                           question:
     *                             type: string
     *                             example: "이 문제의 정답은 뭘까요?"
     *                             description: "퀴즈"
     *                           answer:
     *                             type: boolean
     *                             example: true
     *                             description: "퀴즈 문제에 대한 정답 (true/false)"
     *                           description:
     *                             type: string
     *                             example: "이 문제의 정답은 이래이래서 이겁니다."
     *                             description: "퀴즈 정답 설명"
     *       400:
     *         description: "잘못된 요청"
     */
    this.router.get('/quizzes', authenticateJWT, this.getQuizzes.bind(this));

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
      '/quizzes/:quizId',
      authenticateJWT,
      this.saveQuizAnswerHistory.bind(this)
    );
  }

  private async createQuiz(req: Request, res: Response) {
    const { question, answer, description } = req.body;

    const createdQuiz = await this.quizService.createQuiz({
      question,
      answer,
      description,
    });

    const response: QuizDto = {
      id: createdQuiz.quiz_id,
      question: createdQuiz.question,
      answer: createdQuiz.correct_answer,
      description: createdQuiz.description,
    };

    res.status(StatusCodes.OK).success({ response });
  }

  private async getQuizzes(req: Request, res: Response) {
    try {
      const quizzes = await this.quizService.getRandomQuizzes();

      const response: QuizListDto = {
        number_of_quiz: quizzes.length,
        quiz_list: quizzes.map((quiz) => ({
          id: quiz.quiz_id,
          question: quiz.question,
          answer: quiz.correct_answer,
          description: quiz.description,
        })),
      };

      res.status(StatusCodes.OK).success({ response });
    } catch (error) {
      console.error('Error fetching quizzes:', error); // 에러 로그 출력
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          isSuccess: false,
          code: 'SERVER500',
          message: '서버 오류 발생',
          error: error.message,
        });
    }
  }

  private async saveQuizAnswerHistory(req: Request, res: Response) {
    const user = req.user;
    const quizId = req.params.quizId;
    const isCorrect = req.body.isCorrect;

    await this.quizService.saveQuizAnswerHistory({
      userId: +user.userId,
      quizId: +quizId,
      isCorrect,
    });

    res.status(StatusCodes.OK).success({
      message: '퀴즈 기록이 저장되었습니다.',
    });
  }
}
