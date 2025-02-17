import { PrismaClient , MediaType } from '@prisma/client';
import { prisma } from '../db.config.js';
export class TipRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient(); // ✅ Prisma 인스턴스 생성
  }

  // 팁 제목으로 조회
  public async getTipByTitle(title: string) {
    return await prisma.tip.findFirst({
      where: { title },
    });
  }

  //팁 ID 로 조회 (미디어 포함)
  public async getTipById(tipId: number) {
    return await prisma.tip.findUnique({
      where: { tips_id: tipId },
      include: {
        user: {
          select: {
            user_id: true,
            nickname: true,
            profile_image_url: true,
          },
        },
        hashtags: { include: { hashtag: true } },
        media: true,
        likes: true,
        saves: true,
      },
    });
  }
  
  public async createTip(data: { userId: number; title: string; content: string }) {
    return await prisma.tip.create({
      data: {
        user_id: data.userId,
        title: data.title,
        content: data.content,
      },
    });
  }

  // ✅ 이미지 저장 메서드 수정
  public async saveImages(tipId: number, images: { media_url: string; media_type: string }[]) {
    return await prisma.tipMedia.createMany({
      data: images.map((image) => ({
        tips_id: tipId,
        media_url: image.media_url,
        media_type: this.getMediaType(image.media_type), // ✅ ENUM 변환 추가
        uploaded_at: new Date(),
      })),
    });
  }

  // ✅ media_type 변환 함수 추가
  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith("image/")) {
      return MediaType.image; // ✅ Prisma ENUM 값으로 변환
    } else if (mimeType.startsWith("video/")) {
      return MediaType.video;
    } else {
      throw new Error(`Unsupported media type: ${mimeType}`);
    }
  }

  // 팁 수정 (제목, 내용, 새 이미지 추가)
  public async updateTip(tipId: number, title: string, content: string, newImages: { media_url: string; media_type: MediaType }[]) {
    const updatedTip = await prisma.tip.update({
      where: { tips_id: tipId },
      data: { title, content, updated_at: new Date() },
    });

    // 기존 이미지 삭제 (필요 시)
    await prisma.tipMedia.deleteMany({ where: { tips_id: tipId } });

    // 새 이미지 추가
    if (newImages.length > 0) {
      await prisma.tipMedia.createMany({
        data: newImages.map((image) => ({
          tips_id: tipId,
          media_url: image.media_url,
          media_type: image.media_type, // ✅ ENUM 값으로 저장
          uploaded_at: new Date(),
        })),
      });
    }

    return updatedTip;
  }


  // 팁 삭제
  public async deleteTip(tipId: number) {
    return await prisma.tip.delete({
      where: { tips_id: tipId },
    });
  }

  //해시태그 연결 
  public async associateHashtagsWithTip(tips_id: number, hashtagIds: number[]) {
    if (!hashtagIds || hashtagIds.length === 0) {
      console.log("❌ 저장할 해시태그가 없습니다.");
      return;
    }
  
    const data = hashtagIds.map((hashtag_id) => ({
      tips_id,
      hashtag_id,
    }));
  
    console.log("✅ 해시태그 저장 데이터:", data);
  
    await prisma.tipHashtag.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // 전체 팁 조회 (페이지네이션 포함, 제목, 내용, 해시태그, 이미지 포함)
  public async getAllTips(skip: number, take: number) {
    return await prisma.tip.findMany({
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        media: true, // ✅ 업로드된 이미지 포함
        hashtags: { include: { hashtag: true } }, // ✅ 해시태그 포함
        user: { select: { user_id: true, nickname: true, profile_image_url: true } }, // ✅ 작성자 정보 포함
      },
    });
  }


   // ✅ 정렬된 팁 조회 (좋아요, 저장 개수를 포함)
   public async getSortedTips(skip: number, take: number) {
    return await prisma.tip.findMany({
      skip,
      take,
      orderBy: {
        created_at: 'desc', // 최신순 정렬
      },
      select: {
        tips_id: true, // ID 포함
        title: true,
        content: true,
        created_at: true,
        media: {
          select: {
            media_url: true, // ✅ 미디어 URL만 가져옴
            media_type: true, // ✅ 미디어 타입만 가져옴
          }
        },
        hashtags: {
          select: {
            hashtag: true // ✅ 해시태그 값만 가져옴
          }
        },
        user: {
          select: {
            nickname: true, // ✅ 사용자 닉네임만 가져옴
            profile_image_url: true, // ✅ 프로필 이미지 URL만 가져옴
          }
        },
        _count: {
          select: {
            likes: true, // ✅ 좋아요 개수
            saves: true, // ✅ 북마크 개수
          }
        },
      },
    });
  }
  


  // 팁 상세 조회 기능
  public async getTipInfo(tipId: number) {

      // ✅ `tipId`가 올바르게 전달되는지 확인
      console.log("getTipInfo() 호출됨, tipId:", tipId);
    
      // ✅ `tipId`가 숫자인지 검증 후 실행
      if (!tipId || isNaN(tipId)) {
        throw new Error("Invalid tipId: " + tipId);
      }

    return await prisma.tip.findUnique({
      where: {
        tips_id: tipId
      },
      select: {
        tips_id: true,
        title: true,
        content: true,
        created_at: true,
        media: {
          select: {
            media_url: true,
            media_type: true
          }
        },
        hashtags: {
          select: {
            hashtag: true
          }
        },
        user: {
          select: {
            user_id: true,
            nickname: true,
            profile_image_url: true
          }
        },
        _count: {
          select: {
            likes: true,
            saves: true
          }
        }
      }
    });
  }

//팁 검색 기능 (제목, 내용, 해시태그 포함)
public async searchTips(query: string | null, hashtags: string[], skip: number, take: number) {
  return await prisma.tip.findMany({
      where: {
          AND: [
              // ✅ 제목/내용 검색 (`query`가 있을 경우만 추가)
              ...(query ? [{
                  OR: [
                      { title: { contains: query, mode: "insensitive" } },  
                      { content: { contains: query, mode: "insensitive" } }, 
                      { hashtags: { some: { hashtag: { name: { contains: query, mode: "insensitive" } } } } }
                  ]
              }] : []),

              // ✅ 해시태그 검색 (`hashtags`가 있을 경우만 추가)
              ...(hashtags.length > 0 ? [{
                  hashtags: {
                      some: {
                          hashtag: {
                              name: { in: hashtags }, 
                          },
                      },
                  },
              }] : []),
          ],
      },
      skip,
      take,
      include: {
          media: true,
          hashtags: { include: { hashtag: true } },
          user: { select: { user_id: true, nickname: true, profile_image_url: true } },
          likes: true,
          saves: true,
      },
  });
}


 // 새로운 상세 조회 기능 추가
public async findTipDetails(tipId: number) {
  return await prisma.tip.findUnique({
    where: {
      tips_id: tipId
    },
    include: {
      user: {
        select: {
          user_id: true,
          nickname: true,
          profile_image_url: true
        }
      },
      hashtags: {
        include: {
          hashtag: true
        }
      },
      media: true,
      likes: true,
      saves: true
    }
  });
}

}
