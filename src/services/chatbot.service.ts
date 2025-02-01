import openai from '../config/openai.config';

export class ChatbotService {
  async getChatbotResponse(question: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // ✅ gpt-4 → gpt-3.5-turbo 변경
        messages: [{ role: 'user', content: question }],
        temperature: 0.7,
      });

      return (
        response.choices[0]?.message?.content || '답변을 생성할 수 없습니다.'
      );
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      return '오류가 발생했습니다. 다시 시도해주세요.';
    }
  }
}
