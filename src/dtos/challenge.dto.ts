export class ChallengeDto {
  challengeId: number;
  imageUrl: string;
  title: string;
  startDate: Date;
  endDate: Date;
  descriptionTitle: string;
  descriptionContent: string;
  verificationMethod: string;
  likesCount: number;
  bookmarksCount: number;
  sharesCount: number;
  hashtags: string[];
}

export class ChallengeStartDto {}

export class ChallengeVerificationDto {}

export class ChallengeStopDto {}
