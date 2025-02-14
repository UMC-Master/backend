import { v4 as uuidv4 } from "uuid";

// UUID 생성 함수
export const createUUID = (): string => {
  const tokens = uuidv4().split("-");
  console.log("Generated UUID Tokens:", tokens); // 디버깅 용도

  return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
};
