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
      },
    ],
  },
  apis: ['./src/controllers/*.ts'], // 컨트롤러 파일 경로
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };