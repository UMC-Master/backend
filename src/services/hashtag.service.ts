import { PrismaClient } from '@prisma/client';

export class HashtagService {
  // 해시태그 이름을 ID로 변환하는 함수
  async findHashtagsByName(names: string[]) {
    return await prisma.hashtag.findMany({
      where: {
        name: { in: names },
      },
    });
  }
}

// ✅ Prisma 인스턴스 생성
export const prisma = new PrismaClient();
