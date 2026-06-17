import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "./prisma";

const SALT_ROUNDS = 12;
const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 天（秒）

/**
 * 获取 JWT 密钥（从环境变量读取，模块级缓存避免重复编码）
 */
let cachedSecret: Uint8Array | null = null;

function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("环境变量 AUTH_SECRET 未设置");
  }
  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
}

/**
 * 用 bcryptjs 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/**
 * 用 bcryptjs 验证密码
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * 签发 JWT Token（7 天过期）
 */
export async function signToken(payload: {
  userId: number;
  role: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .setIssuedAt()
    .sign(getSecret());
}

/**
 * 验证 JWT Token，返回 payload 或 null
 * 可在 Edge Middleware 中直接使用
 */
export async function verifyToken(
  token: string
): Promise<{ userId: number; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as number,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/**
 * 写入 Session Cookie（httpOnly JWT）
 */
export async function setSession(userId: number, role: string): Promise<void> {
  const token = await signToken({ userId, role });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * 从 Cookie 读取并验证 JWT，返回用户 ID 和角色
 * 用于 Server Components / API 路由
 */
export async function getSession(): Promise<{
  userId: number;
  role: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * 获取当前登录用户的完整信息（不含密码）
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * 清除 Session Cookie（退出登录）
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
