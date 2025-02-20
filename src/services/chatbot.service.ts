import { PrismaClient } from '@prisma/client';
import openai from '../config/openai.config';

const prisma = new PrismaClient();

export class ChatbotService {
  // ✅ 새로운 채팅 세션 생성
  async createChatSession(userId?: number, title: string = "새로운 채팅"): Promise<number> {
    const session = await prisma.chatSession.create({
      data: {
        user_id: userId || null,
        title,
      },
    });
    return session.session_id;
  }

  // ✅ 챗봇 응답 생성 & 채팅 저장
  async getChatbotResponse(question: string, sessionId: number, userId?: number): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: question }],
        temperature: 0.7,
      });

      const answer = response.choices[0]?.message?.content || '답변을 생성할 수 없습니다.';

      // ✅ 채팅 저장
      await prisma.chatHistory.create({
        data: {
          session_id: sessionId,
          user_id: userId || null,
          question,
          answer,
        },
      });

      return answer;
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      return '오류가 발생했습니다. 다시 시도해주세요.';
    }
  }

  // ✅ 사용자의 채팅 세션 목록 조회
  async getChatSessions(userId: number) {
    return prisma.chatSession.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      select: { session_id: true, title: true, created_at: true },
    });
  }

  // ✅ 특정 세션의 채팅 기록 조회
  async getChatHistory(sessionId: number) {
    return prisma.chatHistory.findMany({
      where: { session_id: sessionId },
      orderBy: { created_at: 'asc' },
    });
  }
}
