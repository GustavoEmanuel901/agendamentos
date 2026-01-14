import { JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload {
  id: string;
  isAdmin: boolean;
  permissions: {
    logs: boolean;
    appointments: boolean;
  };
}
