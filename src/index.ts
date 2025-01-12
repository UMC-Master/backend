import express, { Request, Response, NextFunction } from 'express';
import { swaggerUi, specs } from './swagger';
import dotenv from 'dotenv';
import cors from 'cors';
import { CommonError } from './errors.js';
import { UserController } from './controllers/user.controller.js';
import { TipController } from './controllers/tip.controller.js';
import { CommunityController } from './controllers/community.controller.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

/**
 * 공통 응답을 사용할 수 있는 헬퍼 함수 등록
 */
app.use((req, res, next) => {
  // 성공 응답
  res.success = (
    response: unknown,
    message: string = '성공입니다.',
    code: string = 'COMMON200'
  ) => {
    return res.json({
      isSuccess: true,
      code,
      message,
      result: response,
    });
  };

  // 실패 응답
  res.error = ({
    errorCode = 'COMMON400',
    reason = '요청 처리 중 오류가 발생했습니다.',
    data = null,
  }: {
    errorCode?: string;
    reason?: string;
    data?: unknown;
  }) => {
    return res.json({
      isSuccess: false,
      code: errorCode,
      message: reason,
      result: data,
    });
  };

  next();
});

app.use(cors()); // CORS 설정
app.use(express.static('public')); // 정적 파일 제공
app.use(express.json()); // JSON 요청 바디 파싱
app.use(express.urlencoded({ extended: false })); // URL-encoded 요청 바디 파싱

// Swagger UI 연결
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// UserController 통합
const userController = new UserController();
app.use(userController.router);

const tipController = new TipController();
app.use(tipController.router);

const communityController = new CommunityController();
app.use(communityController.router);

/**
 * 전역 오류 처리 미들웨어
 */
app.use((err: CommonError, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).error({
    errorCode: err.errorCode || 'unknown',
    reason: err.reason || err.message || null,
    data: err.data || null,
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
