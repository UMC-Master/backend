import { PrismaClient, Prisma, User } from '@prisma/client';
import { DuplicateUserEmailError } from '../errors/errors';
interface UserData {
  email?: string;
  password?: string;
  nickname?: string;
  provider: string;
  providerId: string;
  profileImage?: string;
  status: string; // 추가
}

export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // 사용자 ID로 사용자 조회
  async findUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { user_id: userId },
    });
  }

  // 사용자 이메일로 조회
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // ✅ 특정 providerId로 사용자 조회 (추가)
  async findUserByProviderId(
    provider: string,
    providerId: string
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        provider,
        providerId,
      },
    });
  }

  // 사용자 업데이트
  async updateUser(
    userId: number,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    return this.prisma.user.update({
      where: { user_id: userId },
      data,
    });
  }

  // ✅ 사용자 생성 (providerId 포함)
  async createUser(userData: UserData): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          email: userData.email,
          password: userData.password,
          nickname: userData.nickname,
          provider: userData.provider,
          providerId: userData.providerId,
          profile_image_url: userData.profileImage,
          status: userData.status,
        },
      });
    } catch (error: unknown) {
      if (this.isPrismaError(error) && error.code === 'P2002') {
        throw new DuplicateUserEmailError(
          '이미 등록된 이메일입니다.',
          userData.email
        );
      }
      throw error;
    }
  }

  // 마지막 로그인 시간 업데이트
  async updateLastLogin(userId: number, lastLogin: Date): Promise<User> {
    return this.prisma.user.update({
      where: { user_id: userId },
      data: { last_login: lastLogin },
    });
  }

  // ✅ 특정 providerId로 사용자 조회 후 없으면 생성
  async findOrCreate(userData: UserData): Promise<User> {
    let user = await this.findUserByProviderId(
      userData.provider,
      userData.providerId
    );

    if (!user) {
      user = await this.createUser(userData);
    }

    return user;
  }

  // 여러 개의 해시태그 ID를 한 번에 조회하는 메서드 추가
  async findHashtagsByIds(hashtagIds: number[]) {
    return this.prisma.hashtag.findMany({
      where: {
        hashtag_id: { in: hashtagIds }, // ✅ 배열로 여러 개의 ID 조회
      },
    });
  }

  async addUserHashtags(userId: number, hashtags: number[]) {
    const hashtagData = hashtags.map((hashtagId) => ({
      user_id: userId,
      hashtag_id: hashtagId,
    }));

    await this.prisma.userHashtag.createMany({
      data: hashtagData,
    });
  }

  // Prisma 에러 타입 확인
  private isPrismaError(
    error: unknown
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'meta' in error
    );
  }
}
