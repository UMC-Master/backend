import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";


dotenv.config();

// S3Client 설정 (AWS SDK v3 사용)
const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_KEY as string,
  },
});

// 허용된 이미지 확장자
const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".gif"];

export const imageUploader = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME as string,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, callback) => {
      const uploadDirectory = req.query.directory
        ? `hm/${req.query.directory}`
        : "hm/uploads";

      const extension = path.extname(file.originalname);
      const uuid = uuidv4();

      if (!allowedExtensions.includes(extension.toLowerCase())) {
        return callback(new Error("허용되지 않은 확장자입니다."), "");
      }

      callback(null, `${uploadDirectory}/${uuid}_${file.originalname}`);
    },
    acl: "public-read-write",
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
