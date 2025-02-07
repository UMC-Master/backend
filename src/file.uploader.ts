import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

export const imageUploader = multer({
  storage: multerS3({
    s3: s3, // S3 객체
    bucket: process.env.AWS_S3_BUCKET_NAME, // Bucket 이름
    contentType: multerS3.AUTO_CONTENT_TYPE, // Content-type, 자동으로 찾도록 설정
    key: (_, file, callback) => {
      // 파일명
      const uploadDirectory = ''; // 디렉토리 path 설정을 위해서
      const uuid = uuidv4(); // UUID 생성
      callback(null, `${uploadDirectory}/${uuid}_${file.originalname}`);
    },
  }),
  // 이미지 용량 제한 (5MB)
  limits: { fileSize: 5 * 1024 * 1024 },
});
