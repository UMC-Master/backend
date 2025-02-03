import { QuizNotFoundError } from '../errors/quiz.error.js';
import { QuizRepository } from '../repositories/quiz.repository.js';
import { QuizAnswerRepository } from '../repositories/quizAnswer.repository.js';

export class QuizService {
  private quizRepository: QuizRepository;
  private quizAnswerRepository: QuizAnswerRepository;

  constructor() {
    this.quizRepository = new QuizRepository();
    this.quizAnswerRepository = new QuizAnswerRepository();
  }

  async createQuiz(data) {
    const newQuiz = await this.quizRepository.create({
      user_id: data.userId,
      question: data.question,
      correct_answer: data.answer,
      description: data.description,
      quiz_at: new Date(),
    });

    return newQuiz;
  }

  async getRandomQuizzes(limit = 5) {
    const quizzes = await this.quizRepository.getRandom(limit);
    return quizzes;
  }

  async saveQuizAnswerHistory(data) {
    // validation: 퀴즈 유무 확인
    const quiz = await this.quizRepository.getById(data.quizId);
    if (!quiz) {
      throw new QuizNotFoundError({ quizId: data.quizId });
    }

    const history = await this.quizAnswerRepository.create({
      user_id: data.userId,
      quiz_id: data.quizId,
      is_correct: data.isCorrect,
      submitted_at: new Date(),
    });
    return history;
  }
}
