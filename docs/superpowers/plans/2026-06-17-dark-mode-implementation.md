# 深色/亮色模式适配 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 Mini Mall 实现深色/亮色模式适配，包括语义颜色 token 系统、ThemeProvider、切换按钮，以及 8 个文件的颜色替换。

**架构：** 使用 Tailwind CSS v4 `@theme inline` 定义语义颜色 token + `.dark` class 切换。ThemeProvider 读取 localStorage，注入 `.dark` class。全站硬编码颜色替换为语义 token（`bg-white` → `bg-surface`，`text-gray-900` → `text-text-primary` 等）。

**技术栈：** Tailwind CSS v4、React Context、localStorage

---

### 任务 1：新建 ThemeContext 和 ThemeProvider

**文件：**
- 创建：`src/components/layout/theme-context.tsx`

- [ ] **步骤 1：编写 theme-context.tsx**

```tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "mini-mall-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // 防止 hydration 闪烁
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/components/layout/theme-context.tsx
git commit -m "feat: add ThemeProvider and useTheme hook"
```

---

### 任务 2：新建 ThemeToggle 组件

**文件：**
- 创建：`src/components/layout/theme-toggle.tsx`

- [ ] **步骤 1：编写 theme-toggle.tsx**

```tsx
"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-context";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-text-secondary hover:text-accent hover:bg-surface-tertiary transition-colors"
      aria-label={theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/components/layout/theme-toggle.tsx
git commit -m "feat: add ThemeToggle component"
```

---

### 任务 3：重写 globals.css 为语义 token 系统

**文件：**
- 修改：`src/app/globals.css`

- [ ] **步骤 1：重写 globals.css**

```css
@import "tailwindcss";

@theme inline {
  --color-surface: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-surface-tertiary: #f3f4f6;
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-text-tertiary: #9ca3af;
  --color-text-quaternary: #6b7280;
  --color-border: #e5e7eb;
  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;
  --color-accent-bg: #dbeafe;
  --color-danger: #dc2626;
  --color-danger-bg: #fef2f2;
  --color-success: #16a34a;
  --color-success-bg: #f0fdf4;
  --color-warning: #f97316;
  --color-overlay: rgba(0, 0, 0, 0.4);
  --color-overlay-strong: rgba(0, 0, 0, 0.6);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

.dark {
  --color-surface: #1f2937;
  --color-surface-secondary: #111827;
  --color-surface-tertiary: #374151;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-text-tertiary: #6b7280;
  --color-text-quaternary: #9ca3af;
  --color-border: #374151;
  --color-accent: #3b82f6;
  --color-accent-hover: #60a5fa;
  --color-accent-bg: #1e3a5f;
  --color-danger: #f87171;
  --color-danger-bg: #451a1a;
  --color-success: #4ade80;
  --color-success-bg: #052e16;
  --color-warning: #fb923c;
  --color-overlay: rgba(0, 0, 0, 0.6);
  --color-overlay-strong: rgba(0, 0, 0, 0.8);
}

html {
  transition: background-color 0.3s ease, color 0.3s ease;
}

body {
  font-family: Arial, Helvetica, sans-serif;
}
```

- [ ] **步骤 2：Commit**

```bash
git add src/app/globals.css
git commit -m "feat: replace hardcoded colors with semantic CSS variables in globals.css"
```

---

### 任务 4：修改 layout.tsx — 包裹 ThemeProvider，body 改语义 class

**文件：**
- 修改：`src/app/layout.tsx`

- [ ] **步骤 1：修改 layout.tsx**

当前的 layout.tsx 需要：
1. 导入 `ThemeProvider`
2. `<body>` 的 `className` 从 `bg-gray-50 text-gray-900` 改为 `bg-surface-secondary text-text-primary`
3. 添加 `suppressHydrationWarning` 到 `<html>`（因为服务端/客户端主题可能不同）
4. 用 `ThemeProvider` 包裹 `<div>`

```tsx
import type { Metadata } from "next";
import { GeistSans } from "@/lib/fonts";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/header";
import { ThemeProvider } from "@/components/layout/theme-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Mall - 微型电商",
  description: "一个轻量级的电商平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${GeistSans.variable} bg-surface-secondary text-text-primary antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-8 text-center text-sm text-text-quaternary">
            <p>&copy; {new Date().getFullYear()} Mini Mall. All rights reserved.</p>
          </footer>
          <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

> 注意：如果项目中 `GeistSans` 的定义方式不同（例如在 `layout.tsx` 或 `lib/fonts.ts` 中），需要对应调整导入路径。这里假设 `GeistSans` 来自 `@/lib/fonts` 或直接在 `layout.tsx` 中定义。

- [ ] **步骤 2：Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wrap ThemeProvider and use semantic color classes in layout"
```

---

### 任务 5：修改 header.tsx — 颜色替换 + 加入 ThemeToggle

**文件：**
- 修改：`src/components/layout/header.tsx`

- [ ] **步骤 1：颜色替换（导入 ThemeToggle，颜色全换）**

```tsx
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
```

颜色映射：
| 旧 | 新 |
|---|---|
| `bg-white` | `bg-surface` |
| `border-gray-200` | `border-border` |
| `text-gray-900` | `text-text-primary` |
| `text-blue-600` | `text-accent` |
| `text-gray-600` | `text-text-secondary` |
| `hover:text-blue-600` | `hover:text-accent` |
| `text-gray-700` | `text-text-primary` |
| `bg-blue-600` | `bg-accent` |
| `text-white` | `text-white` (保留) |

- [ ] **步骤 2：Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "feat: replace colors with semantic tokens and add ThemeToggle in header"
```

---

### 任务 6：修改 logout-button.tsx — 颜色替换

**文件：**
- 修改：`src/components/layout/logout-button.tsx`

- [ ] **步骤 1：颜色替换**

```tsx
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
```

颜色映射：
| 旧 | 新 |
|---|---|
| `text-gray-500` | `text-text-quaternary` |
| `hover:text-red-600` | `hover:text-danger` |

- [ ] **步骤 2：Commit**

```bash
git add src/components/layout/logout-button.tsx
git commit -m "feat: replace colors with semantic tokens in logout-button"
```

---

### 任务 7：修改 product-card.tsx — 颜色替换

**文件：**
- 修改：`src/components/product/product-card.tsx`

- [ ] **步骤 1：颜色替换**

```tsx
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 5;

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    stock: number;
    slug: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square relative overflow-hidden bg-surface-tertiary">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-text-tertiary" />
          </div>
        )}
        {isOutOfStock && (
          <>
            <div className="absolute inset-0 bg-overlay flex items-center justify-center">
              <span className="bg-overlay-strong text-white px-4 py-2 rounded-lg text-sm font-medium">
                已售罄
              </span>
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-text-primary group-hover:text-accent font-medium truncate">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-danger">
            ¥{formatPrice(product.price)}
          </span>
          {isLowStock && (
            <span className="text-xs text-warning">仅剩 {product.stock} 件</span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

颜色映射：
| 旧 | 新 |
|---|---|
| `bg-white` | `bg-surface` |
| `border-gray-200` | `border-border` |
| `bg-gray-100` | `bg-surface-tertiary` |
| `text-gray-400` | `text-text-tertiary` |
| `bg-black/40` | `bg-overlay` |
| `bg-black/60` | `bg-overlay-strong` |
| `text-white` | `text-white` (保留) |
| `text-gray-900` | `text-text-primary` |
| `group-hover:text-blue-600` | `group-hover:text-accent` |
| `text-red-600` | `text-danger` |
| `text-orange-500` | `text-warning` |

- [ ] **步骤 2：Commit**

```bash
git add src/components/product/product-card.tsx
git commit -m "feat: replace colors with semantic tokens in product-card"
```

---

### 任务 8：修改首页 page.tsx — 颜色替换

**文件：**
- 修改：`src/app/page.tsx`

- [ ] **步骤 1：颜色替换**

替换规则（全文替换）：
| 旧 | 新 |
|---|---|
| `bg-white` | `bg-surface` |
| `border-gray-200` | `border-border` |
| `bg-blue-600` | `bg-accent` |
| `hover:bg-blue-700` | `hover:bg-accent-hover` |
| `text-white` | `text-white` (保留) |
| `text-gray-400` | `text-text-tertiary` |
| `text-gray-500` | `text-text-quaternary` |
| `text-gray-600` | `text-text-secondary` |
| `hover:bg-gray-50` | `hover:bg-surface-tertiary` |
| `hover:bg-gray-100` | `hover:bg-surface-tertiary` |
| `focus:ring-blue-500` | `focus:ring-accent` |

- [ ] **步骤 2：Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: replace colors with semantic tokens in home page"
```

---

### 任务 9：修改商品详情 products/[id]/page.tsx — 颜色替换

**文件：**
- 修改：`src/app/products/[id]/page.tsx`

- [ ] **步骤 1：颜色替换**

替换规则：
| 旧 | 新 |
|---|---|
| `bg-white` | `bg-surface` |
| `bg-gray-100` | `bg-surface-tertiary` |
| `bg-gray-300` | `bg-surface-tertiary` |
| `bg-blue-600` | `bg-accent` |
| `hover:bg-blue-700` | `hover:bg-accent-hover` |
| `bg-red-50` | `bg-danger-bg` |
| `bg-green-50` | `bg-success-bg` |
| `text-gray-900` | `text-text-primary` |
| `text-gray-500` | `text-text-quaternary` |
| `text-gray-600` | `text-text-secondary` |
| `text-gray-400` | `text-text-tertiary` |
| `text-red-600` | `text-danger` |
| `text-green-600` | `text-success` |
| `text-blue-600` | `text-accent` |
| `hover:text-blue-600` | `hover:text-accent` |
| `hover:text-blue-700` | `hover:text-accent-hover` |
| `border-gray-200` | `border-border` |
| `bg-black/40` | `bg-overlay` |
| `bg-black/60` | `bg-overlay-strong` |
| `text-white` | `text-white` (保留) |

- [ ] **步骤 2：Commit**

```bash
git add src/app/products/\[id\]/page.tsx
git commit -m "feat: replace colors with semantic tokens in product detail page"
```

---

### 任务 10：修改登录页 auth/login/page.tsx — 颜色替换

**文件：**
- 修改：`src/app/auth/login/page.tsx`

- [ ] **步骤 1：颜色替换**

替换规则：
| 旧 | 新 |
|---|---|
| `bg-white` | `bg-surface` |
| `border-gray-200` | `border-border` |
| `bg-blue-100` | `bg-accent-bg` |
| `bg-blue-600` | `bg-accent` |
| `hover:bg-blue-700` | `hover:bg-accent-hover` |
| `bg-red-50` | `bg-danger-bg` |
| `bg-gray-300` | `bg-surface-tertiary` |
| `text-gray-900` | `text-text-primary` |
| `text-gray-500` | `text-text-quaternary` |
| `text-gray-700` | `text-text-primary` |
| `text-blue-600` | `text-accent` |
| `hover:text-blue-700` | `hover:text-accent-hover` |
| `text-white` | `text-white` (保留) |
| `text-red-600` | `text-danger` |
| `focus:ring-blue-500` | `focus:ring-accent` |

- [ ] **步骤 2：Commit**

```bash
git add src/app/auth/login/page.tsx
git commit -m "feat: replace colors with semantic tokens in login page"
```

---

### 任务 11：修改注册页 auth/register/page.tsx — 颜色替换

**文件：**
- 修改：`src/app/auth/register/page.tsx`

- [ ] **步骤 1：颜色替换**

替换规则（与 login 基本一致，额外 `bg-green-100` → `bg-success-bg`、`text-green-600` → `text-success`）：

| 旧 | 新 |
|---|---|
| `bg-white` | `bg-surface` |
| `border-gray-200` | `border-border` |
| `bg-green-100` | `bg-success-bg` |
| `bg-blue-600` | `bg-accent` |
| `hover:bg-blue-700` | `hover:bg-accent-hover` |
| `bg-red-50` | `bg-danger-bg` |
| `bg-gray-300` | `bg-surface-tertiary` |
| `text-gray-900` | `text-text-primary` |
| `text-gray-500` | `text-text-quaternary` |
| `text-gray-700` | `text-text-primary` |
| `text-green-600` | `text-success` |
| `text-blue-600` | `text-accent` |
| `hover:text-blue-700` | `hover:text-accent-hover` |
| `text-white` | `text-white` (保留) |
| `text-red-600` | `text-danger` |
| `focus:ring-blue-500` | `focus:ring-accent` |

- [ ] **步骤 2：Commit**

```bash
git add src/app/auth/register/page.tsx
git commit -m "feat: replace colors with semantic tokens in register page"
```

---

### 任务 12：验证构建

- [ ] **步骤 1：运行 TypeScript 检查和构建**

```bash
npm run build
```

预期：编译成功，零错误，零警告。

- [ ] **步骤 2：启动开发服务器验证**

```bash
npm run dev
```

访问以下页面确认主题切换正常：
1. `http://localhost:3000` — 首页，Header 有主题切换按钮
2. `/products/1` — 商品详情，确认暗色模式正常
3. `/auth/login` — 登录页
4. `/auth/register` — 注册页
5. 点击切换按钮，确认亮色/暗色切换
6. 刷新页面，确认主题持久化
7. 清除 localStorage，确认跟随系统

- [ ] **步骤 3：最终 Commit**

```bash
git add -A
git commit -m "chore: complete dark mode adaptation"
```
