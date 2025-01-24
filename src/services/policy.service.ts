import { policyRequestDto } from '../dtos/policy.dto.js';
import { HashtagRepository } from '../repositories/hashtag.repository.js';
import { LocationRepository } from '../repositories/location.repository.js';
import { MagazineBookmarkRepository } from '../repositories/magazineBookmark.repository.js';
import { MagazineHashtagRepository } from '../repositories/magazineHashtag.repository.js';
import { MagazineLikeRepository } from '../repositories/magezineLike.repository.js';
import { OrganizationRepository } from '../repositories/organization.repository.js';
import { PolicyRepository } from '../repositories/policy.repository.js';

export class PolicyService {
  private policyRepository: PolicyRepository;
  private locationRepository: LocationRepository;
  private organizationRepository: OrganizationRepository;
  private hashtagRepository: HashtagRepository;
  private magazineHashtagRepository: MagazineHashtagRepository;
  private magazineLikeRepository: MagazineLikeRepository;
  private magazineBookmarkRepository: MagazineBookmarkRepository;

  constructor() {
    this.policyRepository = new PolicyRepository();
    this.locationRepository = new LocationRepository();
    this.organizationRepository = new OrganizationRepository();
    this.hashtagRepository = new HashtagRepository();
    this.magazineHashtagRepository = new MagazineHashtagRepository();
    this.magazineLikeRepository = new MagazineLikeRepository();
    this.magazineBookmarkRepository = new MagazineBookmarkRepository();
  }

  async createPolicy(data: policyRequestDto) {
    // validation: 존재하는 기관인지, 존재하는 지역인지 확인
    const organization = await this.organizationRepository.getById(
      data.organization_id
    );
    if (organization === null) {
      throw new Error();
    }
    const location = await this.locationRepository.getById(data.location_id);
    if (location === null) {
      throw new Error();
    }
    // validation: 존재하는 해시태그인지 확인
    let hashtag_list = [];
    for (const hashtag of data.magazine_hashtag_id_list) {
      const foundHashtag = await this.hashtagRepository.getById(hashtag);
      if (foundHashtag === null) {
        throw new Error();
      }
      hashtag_list = [...hashtag_list, foundHashtag];
    }

    // business logic & respones : 정책 소개글 생성 및 해시태그 저장
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

    let returnHashtag = [];
    for (const hashtag of hashtag_list) {
      const savedHashtag =
        await this.magazineHashtagRepository.createMagazineHashtag(
          policy.magazine_id,
          hashtag.hashtag_id
        );
      returnHashtag = [
        ...returnHashtag,
        {
          id: savedHashtag.hashtag.hashtag_id,
          name: savedHashtag.hashtag.name,
        },
      ];
    }

    return {
      ...policy,
      magazine_likes: 0,
      magazine_bookmarks: 0,
      hashtag_list: returnHashtag,
    };
  }

  async updatePolicy(policy_id: number, data: policyRequestDto) {
    // validation: 존재하는 기관인지, 존재하는 지역인지, 존재하는 정책인지 확인
    const organization = await this.organizationRepository.getById(
      data.organization_id
    );
    if (organization === null) {
      throw new Error();
    }
    const location = await this.locationRepository.getById(data.location_id);
    if (location === null) {
      throw new Error();
    }
    const policy = await this.policyRepository.getById(policy_id);
    if (policy === null) {
      throw new Error();
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
      throw new Error();
    }

    const likes =
      await this.magazineLikeRepository.getCountByMagazineId(policy_id);
    const bookmarks =
      await this.magazineBookmarkRepository.getCountByMagazineId(policy_id);

    const hashtags =
      await this.magazineHashtagRepository.getHashtagsByPolicyId(policy_id);
    let returnHashtag = [];
    for (const hashtag of hashtags) {
      returnHashtag = [
        ...returnHashtag,
        {
          id: hashtag.hashtag_id,
          name: hashtag.hashtag.name,
        },
      ];
    }

    // response: 반환
    return {
      ...policy,
      magazine_likes: likes,
      magazine_bookmarks: bookmarks,
      hashtag_list: returnHashtag,
    };
  }

  async getPolicyListByLocation(location_id: number) {
    // validation: 존재하는 지역인지 확인
    const location = await this.locationRepository.getById(location_id);
    if (location === null) {
      throw new Error();
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
      throw new Error();
    }

    // business logic: 삭제
    await this.policyRepository.delete(policy_id);
  }
}
