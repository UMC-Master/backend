// middleware/uuid.js

import { v4 } from 'uuid';  // uuid4 사용

// uuid 생성
export const createUUID = () => {
    const tokens = v4().split('-');
    console.log("token", tokens);  // 잘 생성되었나 확인용
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
};