import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

/**
 * 已登录用户访问登录/注册页面时自动重定向到首页
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
