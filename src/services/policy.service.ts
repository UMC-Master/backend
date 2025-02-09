import { policyRequestDto } from '../dtos/policy.dto.js';
import { HashtagNotFoundError } from '../errors/hashtag.error.js';
import { LocationNotFoundError } from '../errors/location.error.js';
import { OrganizationNotFoundError } from '../errors/organization.error.js';
import { PolicyNotFoundError } from '../errors/policy.error.js';
import { UserNotFoundError } from '../errors/user.error.js';
import { HashtagRepository } from '../repositories/hashtag.repository.js';
import { LocationRepository } from '../repositories/location.repository.js';
import { MagazineBookmarkRepository } from '../repositories/magazineBookmark.repository.js';
import { MagazineHashtagRepository } from '../repositories/magazineHashtag.repository.js';
import { MagazineImageRepository } from '../repositories/magazineImage.repository.js';
import { MagazineLikeRepository } from '../repositories/magezineLike.repository.js';
import { OrganizationRepository } from '../repositories/organization.repository.js';
import { PolicyRepository } from '../repositories/policy.repository.js';
import { UserRepository } from '../repositories/user.repository.js';

export class PolicyService {
  private userRepository: UserRepository;
  private policyRepository: PolicyRepository;
  private locationRepository: LocationRepository;
  private organizationRepository: OrganizationRepository;
  private hashtagRepository: HashtagRepository;
  private magazineHashtagRepository: MagazineHashtagRepository;
  private magazineLikeRepository: MagazineLikeRepository;
  private magazineBookmarkRepository: MagazineBookmarkRepository;
  private magazineImageRepository: MagazineImageRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.policyRepository = new PolicyRepository();
    this.locationRepository = new LocationRepository();
    this.organizationRepository = new OrganizationRepository();
    this.hashtagRepository = new HashtagRepository();
    this.magazineHashtagRepository = new MagazineHashtagRepository();
    this.magazineLikeRepository = new MagazineLikeRepository();
    this.magazineBookmarkRepository = new MagazineBookmarkRepository();
    this.magazineImageRepository = new MagazineImageRepository();
  }

  async createPolicy(data: policyRequestDto) {
    // validation: 존재하는 기관인지, 존재하는 지역인지 확인
    const organization = await this.organizationRepository.getById(
      +data.organization_id
    );
    if (!organization) {
      throw new OrganizationNotFoundError({
        organization_id: data.organization_id,
      });
    }
    const location = await this.locationRepository.getById(data.location_id);
    if (!location) {
      throw new LocationNotFoundError({ location_id: data.location_id });
    }
    // validation: 존재하는 해시태그인지 확인
    let hashtag_list = [];
    for (const hashtag of data.magazine_hashtag_id_list) {
      const foundHashtag = await this.hashtagRepository.getById(+hashtag);
      if (foundHashtag === null) {
        throw new HashtagNotFoundError({ hashtag_id: hashtag });
      }
      hashtag_list = [...hashtag_list, foundHashtag];
    }

    // business logic: 정책 소개글 생성
    const policy = await this.policyRepository.create({
      title: data.title,
      description: data.description,
      created_at: new Date(),
      updated_at: new Date(),
      policy_url: data.policy_url,
      organization: {
        connect: { organization_id: organization.organization_id },
      },
      location: { connect: { location_id: location.location_id } },
    });

    // business logic: 해시태그 저장
    const returnHashtag = [];
    for (const hashtag of hashtag_list) {
      const savedHashtag =
        await this.magazineHashtagRepository.createMagazineHashtag(
          policy.magazine_id,
          hashtag.hashtag_id
        );
      returnHashtag.push({
        id: savedHashtag.hashtag.hashtag_id,
        name: savedHashtag.hashtag.name,
      });
    }

    // business logic: 이미지 저장
    const returnImageUrl = [];
    for (const imageUrl of data.iamge_url_list) {
      const savedImageUrl = await this.magazineImageRepository.create(
        policy.magazine_id,
        imageUrl
      );
      returnImageUrl.push(savedImageUrl.image_url);
    }

    return {
      ...policy,
      magazine_likes: 0,
      magazine_bookmarks: 0,
      hashtag_list: returnHashtag,
      image_url_list: returnImageUrl,
    };
  }

  async updatePolicy(policy_id: number, data: policyRequestDto) {
    // validation: 존재하는 기관인지, 존재하는 지역인지, 존재하는 정책인지 확인
    const organization = await this.organizationRepository.getById(
      +data.organization_id
    );
    if (!organization) {
      throw new OrganizationNotFoundError({
        organization_id: data.organization_id,
      });
    }
    const location = await this.locationRepository.getById(data.location_id);
    if (!location) {
      throw new LocationNotFoundError({ location_id: data.location_id });
    }
    const policy = await this.policyRepository.getById(policy_id);
    if (policy === null) {
      throw new PolicyNotFoundError({ policy_id: policy_id });
    }

    // business logic & response: 업데이트 및 반환
    return await this.policyRepository.update(policy_id, {
      title: data.title,
      description: data.description,
      updated_at: new Date(),
      policy_url: data.policy_url,
      organization: {
        connect: { organization_id: organization.organization_id },
      },
      location: { connect: { location_id: location.location_id } },
    });
  }

  async getPolicy(policy_id: number) {
    // validation & business logic: 존재하는 정책인지 확인
    const policy = await this.policyRepository.getById(policy_id);
    if (policy === null) {
      throw new PolicyNotFoundError({ policy_id: policy_id });
    }

    const likes =
      await this.magazineLikeRepository.getCountByMagazineId(policy_id);
    const bookmarks =
      await this.magazineBookmarkRepository.getCountByMagazineId(policy_id);

    const hashtags =
      await this.magazineHashtagRepository.getHashtagsByPolicyId(policy_id);
    const returnHashtag = [];
    for (const hashtag of hashtags) {
      returnHashtag.push({
        id: hashtag.hashtag_id,
        name: hashtag.hashtag.name,
      });
    }

    const images =
      await this.magazineImageRepository.getByMagazineId(policy_id);
    const returnImageUrl = [];
    for (const imageUrl of images) {
      returnImageUrl.push(imageUrl.image_url);
    }

    // response: 반환
    return {
      ...policy,
      magazine_likes: likes,
      magazine_bookmarks: bookmarks,
      hashtag_list: returnHashtag,
      image_url_list: returnImageUrl,
    };
  }

  async getPolicyListByLocation(location_id: number) {
    // validation: 존재하는 지역인지 확인
    const location = await this.locationRepository.getById(location_id);
    if (location === null) {
      throw new LocationNotFoundError({ location_id: location_id });
    }

    // business logic: 해당 지역에 존재하는 정책 조회
    const policyList = await this.policyRepository.getByLocation(location);

    // response
    return policyList;
  }

  async deletePolicy(policy_id: number) {
    // validation: 존재하는 정책인지 확인
    const policy = await this.policyRepository.getById(policy_id);
    if (policy === null) {
      throw new PolicyNotFoundError({ policy_id: policy_id });
    }

    // business logic: 삭제
    await this.policyRepository.delete(policy_id);

    // todo: 연관 해시태그 삭제
  }

  async likePolicy(userId: number, policyId: number) {
    // validation
    const user = await this.userRepository.findUserById(+userId);
    if (!user) {
      throw new UserNotFoundError({ userId });
    }
    const policy = await this.policyRepository.getById(+policyId);
    if (!policy) {
      throw new PolicyNotFoundError({ policyId });
    }

    // business logic
    const policyLike =
      await this.magazineLikeRepository.findByUserIdANdMagazineId(
        userId,
        policyId
      );

    if (policyLike) {
      await this.magazineLikeRepository.delete(policyLike.magazine_like_id);
      return { message: '좋아요 취소' };
    } else {
      await this.magazineLikeRepository.create(userId, policyId);
      return { message: '좋아요' };
    }
  }

  async bookmarkPolicy(userId: number, policyId: number) {
    // validation
    const user = await this.userRepository.findUserById(+userId);
    if (!user) {
      throw new UserNotFoundError({ userId });
    }
    const policy = await this.policyRepository.getById(+policyId);
    if (!policy) {
      throw new PolicyNotFoundError({ policyId });
    }

    // business logic
    const policyBookmark =
      await this.magazineBookmarkRepository.findByUserIdANdMagazineId(
        userId,
        policyId
      );

    if (policyBookmark) {
      await this.magazineBookmarkRepository.delete(
        policyBookmark.magazine_bookmark_id
      );
      return { message: '북마크 취소' };
    } else {
      await this.magazineBookmarkRepository.create(userId, policyId);
      return { message: '북마크' };
    }
  }
}
