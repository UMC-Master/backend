export interface QuizListDto {
  numberOfQuiz: number;
  QuizList: [
    {
      description: string;
      answer: boolean;
    },
  ];
}
