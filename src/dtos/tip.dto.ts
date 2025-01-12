export interface TipDto {
  tipId: number;
  title: string;
  imageUrlList: [string];
  description: string;
  authorId: number;
  valid: boolean;
}
