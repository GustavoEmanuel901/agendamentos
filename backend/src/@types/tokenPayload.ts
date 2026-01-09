import { JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload {
  id: string;
  role: boolean;
  permissions: {
    logs: boolean;
    appointment: boolean;
  };
}
