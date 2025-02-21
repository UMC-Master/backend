import { PrismaClient } from '@prisma/client';
import openai from '../config/openai.config';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const prisma = new PrismaClient();

export class ChatbotService {
  private MAX_CONTEXT_MESSAGES = 10; // ✅ OpenAI에게 전달할 최대 대화 개수 (최근 10개 유지)

  // ✅ 새로운 채팅 세션 생성
  async createChatSession(
    userId?: number,
    title: string = '새로운 채팅'
  ): Promise<number> {
    const session = await prisma.chatSession.create({
      data: {
        user_id: userId || null,
        title,
      },
    });
    return session.session_id;
  }

  // ✅ 챗봇 응답 생성 & 채팅 저장 (이전 대화 포함)
  async getChatbotResponse(
    question: string,
    sessionId: number,
    userId?: number
  ): Promise<string> {
    try {
      // ✅ 이전 대화 내역 가져오기 (최근 MAX_CONTEXT_MESSAGES개만 가져오기)
      const previousMessages = await prisma.chatHistory.findMany({
        where: { session_id: sessionId },
        orderBy: { created_at: 'asc' },
        take: this.MAX_CONTEXT_MESSAGES, // ✅ 가장 최근 N개의 대화만 가져오기
      });

      // ✅ OpenAI 메시지 타입을 명확하게 지정 (user + assistant 메시지 모두 포함)
      const messages: ChatCompletionMessageParam[] = previousMessages.flatMap(
        (chat) => [
          { role: 'user', content: chat.question }, // ✅ 이전 질문
          { role: 'assistant', content: chat.answer }, // ✅ 이전 답변
        ]
      );

      // ✅ 시스템 프롬프트 추가 (필요하면 활성화)
      if (messages.length === 0) {
        messages.unshift({
          role: 'system',
          content:
            '너는 사용자와 대화하는 AI 챗봇이야. 대화를 이어서 진행해줘.',
        });
      }

      // ✅ 현재 질문 추가
      messages.push({ role: 'user', content: question });

      // ✅ OpenAI API 호출 (이전 대화 포함)
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
      });

      const answer =
        response.choices[0]?.message?.content || '답변을 생성할 수 없습니다.';

      // ✅ 새로운 채팅 기록 저장 (세션별 저장)
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
