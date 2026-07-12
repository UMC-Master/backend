import { PrismaClient } from '@prisma/client';

export class HashtagRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // 해시태그 아이디로 조회
  async getById(hashtag_id: number) {
    return await this.prisma.hashtag.findFirst({
      where: {
        hashtag_id: +hashtag_id,
      },
    });
  }

  // 해시태그 이름으로 조회
  async getByName(name: string) {
    return await this.prisma.hashtag.findFirst({
      where: { name },
    });
  }

  // 해시태그 아이디 목록으로 조회
  async getByIds(hashtag_ids: number[]) {
    return await this.prisma.hashtag.findMany({
      where: {
        hashtag_id: {
          in: hashtag_ids,
        },
      },
    });
  }

  // 새로운 해시태그 생성
  async createHashtag(name: string, hashtagTypeId: number) {
    return await this.prisma.hashtag.create({
      data: {
        name,
        hashtag_type_id: hashtagTypeId,
      },
    });
  }

  // 전체 해시태그 조회
  async getAll() {
    return await this.prisma.hashtag.findMany();
  }
}
