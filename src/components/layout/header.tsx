import Link from "next/link";
import { Store, ShoppingCart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./logout-button";
import ThemeToggle from "./theme-toggle";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-text-primary">
            <Store className="w-6 h-6 text-accent" />
            Mini Mall
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-text-secondary hover:text-accent transition-colors"
            >
              全部商品
            </Link>
            <Link
              href="/cart"
              className="relative text-text-secondary hover:text-accent transition-colors"
              aria-label="购物车"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/orders"
                  className="text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  我的订单
                </Link>
                <span className="flex items-center gap-2 text-sm text-text-primary">
                  <span className="w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {user.name.charAt(0)}
                  </span>
                  {user.name}
                </span>
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm text-text-secondary hover:text-accent transition-colors"
                aria-label="用户登录"
              >
                登录
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
