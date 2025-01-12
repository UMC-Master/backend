export interface QuizListDto {
  numberOfQuiz: number;
  quizList: [
    {
      description: string;
      answer: boolean;
    },
  ];
}
