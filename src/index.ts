import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // ✅ 추가

// ES Module 환경에서 `__dirname` 대체 방법
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { swaggerUi, specs } from './swagger';
import { errorHandler } from './middlewares/errorHandler';
import { UserController } from './controllers/user.controller.js';
import { NotificationController } from './controllers/notification.controller.js';
import { TipController } from './controllers/tip.controller.js';
import { CommunityController } from './controllers/community.controller.js';
import { AnalyzeController } from './controllers/analyze.controller.js';
import { PolicyController } from './controllers/policy.controller.js';
import { UserManageController } from './controllers/user.manage.controller.js';
import { QuizController } from './controllers/quiz.controller.js';
import { AdminController } from './controllers/admin.controller';
import { LocationController } from './controllers/location.controller.js';
import { ChatbotController } from './controllers/chatbot.controller.js';
import { OrganizationController } from './controllers/organization.controller.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ 수정된 정적 파일 경로
const staticFilePath = path.join(__dirname, '../public');
console.log(`📂 정적 파일 제공 경로: ${staticFilePath}`);

const setupResponseHelpers = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.success = (response, message = '성공입니다.', code = 'COMMON200') => {
    return res.json({ isSuccess: true, code, message, result: response });
  };

  res.error = ({
    errorCode = 'COMMON400',
    reason = '요청 처리 중 오류가 발생했습니다.',
    data = null,
  }) => {
    return res.status(400).json({
      isSuccess: false,
      code: errorCode,
      message: reason,
      result: data,
    });
  };

  next();
};

// 미들웨어 설정
const setupMiddlewares = (app: express.Express) => {
  app.use(cors());
  app.use('/static', express.static(staticFilePath)); // ✅ 절대 경로 사용
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(setupResponseHelpers);
};

// Swagger 문서 설정
const setupSwaggerDocs = (app: express.Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

// 컨트롤러 등록
const setupControllers = (app: express.Express) => {
  const controllers = [
    new UserController(),
    new NotificationController(),
    new TipController(),
    new CommunityController(),
    new AnalyzeController(),
    new PolicyController(),
    new UserManageController(),
    new QuizController(),
    new AdminController(),
    new LocationController(),
    new ChatbotController(),
    new OrganizationController(),
  ];

  controllers.forEach((controller) => {
    app.use('/api/v1', controller.router);
  });
};

// 루트 경로 설정
const setupRootRoute = (app: express.Express) => {
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: 'API에 오신 것을 환영합니다!',
      routes: {
        users: '/api/v1/users',
        docs: '/api-docs',
      },
    });
  });
};

// 애플리케이션 설정
const setupApp = (app: express.Express) => {
  setupMiddlewares(app);
  setupSwaggerDocs(app);
  setupControllers(app);
  setupRootRoute(app);
  app.use(errorHandler);
};

// 서버 실행
setupApp(app);
app.listen(port, () => {
  console.log(`🚀 서버가 실행 중입니다: http://localhost:${port}`);
  console.log(`📜 Swagger 문서 확인: http://localhost:${port}/api-docs`);
  console.log(`📂 정적 파일 확인: http://localhost:${port}/static/test.txt`);
});
