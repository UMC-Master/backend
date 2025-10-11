import AWS from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

// AWS S3 설정
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// Multer-S3 스토리지 설정
export const imageUploader = multer({
  storage: multerS3({
    s3: s3, // S3 객체
    bucket: process.env.AWS_S3_BUCKET_NAME as string, // S3 버킷 이름
    contentType: multerS3.AUTO_CONTENT_TYPE, // Content-Type 자동 설정
    key: (_, file, callback) => {
      const uploadDirectory = "uploads"; // S3 내 업로드 폴더 지정
      const uuid = uuidv4(); // UUID 생성
      callback(null, `${uploadDirectory}/${uuid}_${file.originalname}`);
    },
  }),
  // 파일 용량 제한 (최대 5MB)
  limits: { fileSize: 5 * 1024 * 1024 },
  // 파일 필터 (이미지 확장자만 허용)
  fileFilter: (_, file, callback) => {
    const allowedExtensions = ["image/png", "image/jpg", "image/jpeg", "image/gif"];
    if (!allowedExtensions.includes(file.mimetype)) {
      return callback(new Error("허용되지 않은 확장자입니다."));
    }
    callback(null, true);
  },
});
