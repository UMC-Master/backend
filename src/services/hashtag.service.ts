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

  async findPopularHashtag(limit = 6) {
    const hashtags = await prisma.hashtag.findMany({
      select: {
        hashtag_id: true,
        name: true,
        magazines: {
          select: {
            magazine: {
              select: {
                magazine_id: true,
                _count: {
                  select: {
                    magazine_likes: true,
                    magazine_bookmarks: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 각 해시태그의 총 인기 점수 계산
    const sortedHashtags = hashtags
      .map((hashtag) => ({
        hashtag_id: hashtag.hashtag_id,
        name: hashtag.name,
        popularity: hashtag.magazines.reduce(
          (sum, magazine) =>
            sum +
            (magazine.magazine?._count?.magazine_likes || 0) +
            (magazine.magazine?._count?.magazine_bookmarks || 0),
          0
        ),
      }))
      .sort((a, b) => b.popularity - a.popularity) // 인기순 정렬
      .slice(0, limit); // 상위 N개 추출

    return sortedHashtags;
  }
}

// ✅ Prisma 인스턴스 생성
export const prisma = new PrismaClient();
