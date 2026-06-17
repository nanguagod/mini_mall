"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // 前端校验
    if (name.trim().length === 0) {
      setError("请输入用户名");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("密码至少需要 6 位字符");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }

      toast.success("注册成功！");
      router.push("/");
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">注册</h1>
            <p className="text-sm text-text-quaternary mt-1">创建你的 Mini Mall 账号</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                用户名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="请输入用户名"
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="请输入邮箱"
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="至少 6 位字符"
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                placeholder="再次输入密码"
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger-bg rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover disabled:bg-surface-tertiary disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          <p className="text-center text-sm text-text-quaternary mt-6">
            已有账号？{" "}
            <Link href="/auth/login" className="text-accent hover:text-accent-hover font-medium">
              去登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
