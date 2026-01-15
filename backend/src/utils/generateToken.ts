import jwt from "jsonwebtoken";
import { TokenPayload } from "../@types/tokenPayload";

function generateToken(params: TokenPayload) {
  return jwt.sign(params, process.env.APP_SECRET!, { expiresIn: 86400 });
}

export default generateToken;
