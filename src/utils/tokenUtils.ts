
import * as jose from 'jose';

// JWT secret key
const JWT_SECRET = new TextEncoder().encode("AstraCodeArenaHQSecretKey2025");

export interface TokenPayload {
  userId?: string;
  questionId?: string;
  [key: string]: any;
}

export const verifyToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};

export const generateToken = async (payload: TokenPayload): Promise<string> => {
  // Create a new JWT, valid for 7 days
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  return jwt;
};
