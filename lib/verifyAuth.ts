import jwt from "jsonwebtoken";
import { AuthPayload } from "@/types/auth";

export function verifyAuth(token?: string): AuthPayload | null {
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
  } catch {
    return null;
  }
}
