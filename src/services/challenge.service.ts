import { ChallengeRepository } from '../repositories/challenge.repository.js';
import { ChallengeAttemptRepository } from '../repositories/challengeAttempt.repository.js';
import { ChallengeVerificationRepository } from '../repositories/challengeVerification.repository.js';
import { ChallengeVerificationImageRepository } from '../repositories/challengeVerificationImage.repository.js';
import { ChallengeHashtagRepository } from '../repositories/challengeHashtag.repository.js';
import { HashtagRepository } from '../repositories/hashtag.repository.js';
import {
  ChallengeAlreadyStartedError,
  ChallengeAttemptForbiddenError,
  ChallengeAttemptNotFoundError,
  ChallengeAttemptNotStartError,
  ChallengeNotFoundError,
} from '../errors/challenge.error.js';
import { ChallengeDto } from '../dtos/challenge.dto.js';

export class ChallengeService {
  private challengeRepository: ChallengeRepository;
  private challengeAttemptRepository: ChallengeAttemptRepository;
  private challengeVerificationRepository: ChallengeVerificationRepository;
  private challengeVerificationImageRepository: ChallengeVerificationImageRepository;
  private challengeHashtagRepository: ChallengeHashtagRepository;
  private hashtagRepository: HashtagRepository;

  constructor() {
    this.challengeRepository = new ChallengeRepository();
    this.challengeAttemptRepository = new ChallengeAttemptRepository();
    this.challengeVerificationRepository =
      new ChallengeVerificationRepository();
    this.challengeVerificationImageRepository =
      new ChallengeVerificationImageRepository();
    this.hashtagRepository = new HashtagRepository();
    this.challengeHashtagRepository = new ChallengeHashtagRepository();
  }

  private toChallengeDto(challenge, hashtags: string[]): ChallengeDto {
    return {
      challengeId: challenge.challenge_id,
      imageUrl: challenge.image_url,
      title: challenge.title,
      startDate: challenge.start_date,
      endDate: challenge.end_date,
      descriptionTitle: challenge.description_title,
      descriptionContent: challenge.description_content,
      verificationMethod: challenge.verification_method,
      likesCount: challenge.likes_count,
      bookmarksCount: challenge.bookmarks_count,
      sharesCount: challenge.shares_count,
      hashtags,
    };
  }

  async getOngoingChallenge() {
    const challenge = await this.challengeRepository.findById(1);
    if (!challenge) {
      throw new ChallengeNotFoundError({ challenge_id: 1 });
    }

    const challengeHashtags =
      await this.challengeHashtagRepository.getHashtagsByChallengeId(1);
    const hashtagIds = challengeHashtags.map(
      (challengeHashtag) => challengeHashtag.hashtag_id
    );
    const hashtags =
      hashtagIds.length > 0
        ? await this.hashtagRepository.getByIds(hashtagIds)
        : [];

    return this.toChallengeDto(
      challenge,
      hashtags.map((hashtag) => hashtag.name)
    );
  }

  async getChallengeById(challenge_id: number) {
    const challenge = await this.challengeRepository.findById(challenge_id);
    if (!challenge) {
      return null;
    }

    const challengeHashtags =
      await this.challengeHashtagRepository.getHashtagsByChallengeId(
        challenge_id
      );
    const hashtagIds = challengeHashtags.map(
      (challengeHashtag) => challengeHashtag.hashtag_id
    );
    const hashtags =
      hashtagIds.length > 0
        ? await this.hashtagRepository.getByIds(hashtagIds)
        : [];

    return this.toChallengeDto(
      challenge,
      hashtags.map((hashtag) => hashtag.name)
    );
  }

  async startChallenge(data: { challenge_id: number; user_id: number }) {
    const challenge = await this.challengeRepository.findById(
      data.challenge_id
    );
    if (!challenge) {
      throw new ChallengeNotFoundError({ challenge_id: data.challenge_id });
    }

    const existingAttempt =
      await this.challengeAttemptRepository.findByChallengeAndUser(
        data.challenge_id,
        data.user_id
      );

    if (existingAttempt && existingAttempt.status !== 'CANCELED') {
      throw new ChallengeAlreadyStartedError({
        challenge_id: data.challenge_id,
        user_id: data.user_id,
        attempt_id: existingAttempt.attempt_id,
      });
    }

    const attemptData = {
      challenge_id: data.challenge_id,
      user_id: data.user_id,
      status: 'START',
    };

    return await this.challengeAttemptRepository.create(attemptData);
  }

  async verifyChallengeAttempt(data: {
    attempt_id: number;
    status: string;
    images?: string[];
  }) {
    const attempt = await this.challengeAttemptRepository.findById(
      data.attempt_id
    );

    if (!attempt) {
      throw new ChallengeAttemptNotFoundError({
        attempt_id: data.attempt_id,
      });
    }

    if (attempt.status !== 'START') {
      throw new ChallengeAttemptNotStartError({
        attempt_id: data.attempt_id,
        current_status: attempt.status,
      });
    }

    const verification = await this.challengeVerificationRepository.create({
      attempt_id: data.attempt_id,
      status: data.status,
      requested_at: new Date(),
    });

    if (data.images && data.images.length > 0) {
      for (const image_url of data.images) {
        await this.challengeVerificationImageRepository.create({
          verification_id: verification.verification_id,
          image_url,
        });
      }
    }

    return verification;
  }

  async stopChallenge(data: { attempt_id: number; user_id: number }) {
    const attempt = await this.challengeAttemptRepository.findById(
      data.attempt_id
    );

    if (!attempt) {
      throw new ChallengeAttemptNotFoundError({
        attempt_id: data.attempt_id,
      });
    }

    if (attempt.user_id !== data.user_id) {
      throw new ChallengeAttemptForbiddenError({
        attempt_id: data.attempt_id,
        user_id: data.user_id,
      });
    }

    return await this.challengeAttemptRepository.update(data.attempt_id, {
      status: 'CANCELED',
    });
  }
}
