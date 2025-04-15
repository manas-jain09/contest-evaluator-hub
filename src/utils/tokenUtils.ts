
import jwt from 'jsonwebtoken';

// JWT secret key
const JWT_SECRET = "AstraCodeArenaHQSecretKey2025";

interface TokenPayload {
  userId?: string;
  questionId?: string;
}

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
