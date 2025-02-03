import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API 명세 문서',
    },
    servers: [
      {
        url: 'http://localhost:3000', // 서버 URL
        description: '로컬 서버',
      },
      {
        url: 'http://43.200.212.90:3000', // ec2 서버 URL
        description: 'ec2 서버',
      },
      {
        url: 'http://43.200.212.90:4000', // 이해승 test용 서버 URL
        description: 'test용 서버 URL',
      },
      {
        url: 'https://d22ej74ddyza9b.cloudfront.net', // 배포된 서버 URL 1
        description: '임시 배포 서버',
      },
      {
        url: 'https://api.hmaster.shop', // 배포된 서버 URL 1
        description: '실배포 서버',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // JWT 인증 사용
        },
      },
    },
    security: [{ bearerAuth: [] }], // 모든 API 엔드포인트에 JWT 인증 적용
  },
  apis: ['./src/controllers/*.ts'], // 컨트롤러 파일 경로
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
