export interface QuizListDto {
  number_of_quiz: number;
  quiz_list: QuizDto[];
}

export interface QuizDto {
  id: number;
  question: string;
  answer: boolean;
  description: string;
}
