import { PrismaClient, Prisma, User } from '@prisma/client';
import { DuplicateUserEmailError } from '../errors';

interface UserData {
  email?: string;
  nickname?: string;
  provider: string;
  providerId: string;
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

  // 사용자 업데이트
  async updateUser(userId: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { user_id: userId },
      data,
    });
  }

  // 사용자 생성
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({ data });
    } catch (error: unknown) {
      if (this.isPrismaError(error) && error.code === 'P2002') {
        throw new DuplicateUserEmailError('이미 사용 중인 이메일 또는 닉네임입니다.', {
          target: error.meta?.target,
        });
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

  // 카카오 사용자 데이터베이스 확인 또는 생성
  async findOrCreate(userData: UserData): Promise<User> {
    // Step 1: 소셜 계정으로 사용자 조회
    let user = await this.prisma.user.findFirst({
      where: {
        provider: userData.provider,
        providerId: userData.providerId,
      },
    });

    // Step 2: 사용자 생성 (존재하지 않을 경우)
    if (!user) {
      try {
        user = await this.prisma.user.create({
          data: {
            email: userData.email,
            nickname: userData.nickname,
            provider: userData.provider,
            providerId: userData.providerId,
            status: userData.status,
          },
        });
      } catch (error: unknown) {
        if (this.isPrismaError(error) && error.code === 'P2002') {
          throw new DuplicateUserEmailError('이미 등록된 이메일입니다.', userData.email);
        }
        throw error;
      }
    }

    return user;
  }

  // Prisma 에러 타입 확인
  private isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'meta' in error
    );
  }
}