import { Router, Request, Response } from 'express';
import { ChatbotService } from '../services/chatbot.service';

export class ChatbotController {
  public router: Router;
  private chatbotService: ChatbotService;

  constructor() {
    this.router = Router();
    this.chatbotService = new ChatbotService();
    this.initializeRoutes(); // 이니셜라이즈 함수 호출
  }

  private initializeRoutes() {
    this.router.post('/chat', this.askChatbot.bind(this));
  }

  /**
   * @swagger
   * /api/v1/chat:
   *   post:
   *     summary: AI 챗봇과 대화
   *     description: AI 챗봇에게 질문을 입력하면 답변을 반환합니다.
   *     tags:
   *       - Chatbot
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               question:
   *                 type: string
   *                 example: "1인 가구를 위한 정책은 뭐가 있나요?"
   *                 description: "사용자가 챗봇에게 묻고 싶은 질문"
   *     responses:
   *       200:
   *         description: 챗봇의 응답을 반환합니다.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 answer:
   *                   type: string
   *                   example: "1인 가구를 위한 정책으로는 청년 월세 지원, 교통비 할인 등이 있습니다."
   *       400:
   *         description: 잘못된 요청 (질문이 입력되지 않음)
   *       500:
   *         description: 서버 오류 발생
   */
  private async askChatbot(req: Request, res: Response) {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ message: '질문을 입력해주세요.' });
      }

      const answer = await this.chatbotService.getChatbotResponse(question);
      return res.json({ answer });
    } catch (error) {
      console.error('Chatbot Error:', error);
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }

  public getRouter() {
    return this.router;
  }
}

export default new ChatbotController().getRouter();
