import jwt from "jsonwebtoken";

function generateToken(params = {}) {
  return jwt.sign(params, process.env.APP_SECRET!);
}

export default generateToken;
