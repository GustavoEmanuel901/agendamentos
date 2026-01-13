import jwt from "jsonwebtoken";

function generateToken(params = {}) {
  return jwt.sign(params, process.env.APP_SECRET!, { expiresIn: 86400 });
}

export default generateToken;
