import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config(); // .env 파일 로드

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,          // AWS 지역 (예: ap-northeast-2)
  accessKeyId: process.env.AWS_ACCESS_KEY, // AWS Access Key
  secretAccessKey: process.env.AWS_SECRET_KEY, // AWS Secret Key
});

export default s3;
