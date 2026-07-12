import { Router, Request, Response } from 'express';
import { ChatbotService } from '../services/chatbot.service';

export class ChatbotController {
  public router: Router;
  private chatbotService: ChatbotService;

  constructor() {
    this.router = Router();
    this.chatbotService = new ChatbotService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/chat', this.askChatbot.bind(this)); // ✅ 질문 시 자동으로 세션 생성됨
    this.router.get('/chat/sessions', this.getChatSessions.bind(this)); // ✅ 사이드바 목록 조회
    this.router.get('/chat/history/:sessionId', this.getChatHistory.bind(this)); // ✅ 특정 세션 대화 조회
  }

  /**
   * @swagger
   * /api/v1/chat:
   *   post:
   *     summary: AI 챗봇과 대화 (자동 세션 생성)
   *     description: AI 챗봇에게 질문을 입력하면 답변을 반환합니다. 첫 질문이면 자동으로 새로운 채팅 세션을 생성합니다.
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
   *               sessionId:
   *                 type: integer
   *                 example: 42
   *                 description: "기존 채팅 세션 ID (없으면 새로 생성됨)"
   *     responses:
   *       200:
   *         description: 챗봇의 응답을 반환합니다.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 sessionId:
   *                   type: integer
   *                 answer:
   *                   type: string
   */
  private async askChatbot(req: Request, res: Response) {
    try {
      let { question, sessionId } = req.body;
      if (!question) {
        return res.status(400).json({ message: '질문을 입력해주세요.' });
      }

      const userId = req.user?.userId || null;

      // ✅ sessionId가 없으면 자동으로 새 세션 생성
      if (!sessionId) {
        sessionId = await this.chatbotService.createChatSession(
          userId,
          '새로운 채팅'
        );
      }

      const answer = await this.chatbotService.getChatbotResponse(
        question,
        sessionId,
        userId
      );
      return res.json({ sessionId, answer });
    } catch (error) {
      console.error('Chatbot Error:', error);
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }

  /**
   * @swagger
   * /api/v1/chat/sessions:
   *   get:
   *     summary: 채팅 세션 목록 조회
   *     description: 사용자의 채팅 세션 목록을 조회합니다. (사이드바에서 표시)
   *     tags:
   *       - Chatbot
   */
  private async getChatSessions(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(403).json({ message: '로그인이 필요합니다.' });
      }

      const sessions = await this.chatbotService.getChatSessions(userId);
      return res.json(sessions);
    } catch (error) {
      console.error('Session list error:', error);
      return res
        .status(500)
        .json({ message: '세션 목록을 불러오는데 실패했습니다.' });
    }
  }

  /**
   * @swagger
   * /api/v1/chat/history/{sessionId}:
   *   get:
   *     summary: 특정 세션의 채팅 기록 조회
   */
  private async getChatHistory(req: Request, res: Response) {
    try {
      const sessionId = parseInt(req.params.sessionId, 10);
      if (!sessionId) {
        return res.status(400).json({ message: '세션 ID가 필요합니다.' });
      }

      const chatHistory = await this.chatbotService.getChatHistory(sessionId);
      return res.json(chatHistory);
    } catch (error) {
      console.error('Chat history error:', error);
      return res
        .status(500)
        .json({ message: '채팅 기록을 불러오는데 실패했습니다.' });
    }
  }
}
