"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        toast.success("已退出登录");
      }
    } catch {
      // 即使请求失败也尝试跳转
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 text-sm text-text-quaternary hover:text-danger transition-colors"
      aria-label="退出登录"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
