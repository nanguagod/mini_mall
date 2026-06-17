# Mini Mall 深色/亮色模式适配设计

## 背景

Mini Mall 项目使用 Tailwind CSS v4，当前只有 `globals.css` 中定义了两组 CSS 变量（`--background` / `--foreground`）用于 `prefers-color-scheme: dark` 媒体查询，但全站 8 个文件均使用硬编码字面颜色（`bg-white`、`text-gray-900`、`border-gray-200` 等），导致暗色模式完全无效。

## 方案选型

**选择方案 B：语义 CSS 变量 + `.dark` class 切换**（可手动切换、可持久化、代码语义化、维护成本低）

## 语义颜色 Token 设计

| Token | 亮色值 | 暗色值 | 用途 |
|-------|--------|--------|------|
| `surface` | `#ffffff` | `#1f2937` | 卡片、头部、搜索框 |
| `surface-secondary` | `#f9fafb` | `#111827` | 页面背景 |
| `surface-tertiary` | `#f3f4f6` | `#374151` | 占位区域、hover 背景 |
| `text-primary` | `#111827` | `#f9fafb` | 标题、正文 |
| `text-secondary` | `#4b5563` | `#d1d5db` | 导航链接、描述文字 |
| `text-tertiary` | `#9ca3af` | `#6b7280` | 提示文字、图标 |
| `text-quaternary` | `#6b7280` | `#9ca3af` | 次要信息 |
| `border` | `#e5e7eb` | `#374151` | 边框、分割线 |
| `accent` | `#2563eb` | `#3b82f6` | 主按钮、链接 |
| `accent-hover` | `#1d4ed8` | `#60a5fa` | 悬停状态 |
| `accent-bg` | `#dbeafe` | `#1e3a5f` | 图标/标签背景 |
| `danger` | `#dc2626` | `#f87171` | 错误、缺货文字 |
| `danger-bg` | `#fef2f2` | `#451a1a` | 错误状态背景 |
| `success` | `#16a34a` | `#4ade80` | 有货状态文字 |
| `success-bg` | `#f0fdf4` | `#052e16` | 状态背景 |
| `warning` | `#f97316` | `#fb923c` | 低库存警告 |
| `overlay` | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.6)` | 图片遮罩 |
| `overlay-strong` | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.8)` | 文字标签 |

## 技术架构

```
用户点击切换 → ThemeContext 更新 → localStorage 持久化 → <html class="dark"> 切换 → CSS 变量切换 → 所有组件自动响应
```

### 组件设计

- **ThemeProvider** — 客户端组件，包裹整个应用。初始化读取 `localStorage` 中的主题偏好，未设置时跟随系统 `prefers-color-scheme`。将 `.dark` class 注入 `<html>` 元素。
- **ThemeToggle** — 按钮组件，放在 Header 中。点击在亮色/暗色间切换，图标用 Sun/Moon。

## 变更清单

### 新建文件

| 文件 | 说明 |
|------|------|
| `src/components/layout/theme-context.tsx` | ThemeProvider + ThemeContext（客户端组件） |
| `src/components/layout/theme-toggle.tsx` | 明暗切换按钮（客户端组件） |

### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/app/globals.css` | 重写为语义 token 系统（`@theme inline` + `.dark` 变量覆盖），移除 `prefers-color-scheme` 媒体查询 |
| `src/app/layout.tsx` | `<body>` 改为 `bg-surface-secondary text-text-primary`，包裹 ThemeProvider，添加 `suppressHydrationWarning` |
| `src/components/layout/header.tsx` | 所有硬编码颜色替换为语义 token + 加入 ThemeToggle |
| `src/components/layout/logout-button.tsx` | 颜色替换为语义 token |
| `src/components/product/product-card.tsx` | 颜色替换为语义 token |
| `src/app/page.tsx` | 颜色替换为语义 token |
| `src/app/products/[id]/page.tsx` | 颜色替换为语义 token |
| `src/app/auth/login/page.tsx` | 颜色替换为语义 token |
| `src/app/auth/register/page.tsx` | 颜色替换为语义 token |

### 颜色映射规则

所有文件按以下映射表替换（亮色模式下视觉无变化）：

| 当前 | 替换为 | 暗色效果 |
|------|--------|---------|
| `bg-white` | `bg-surface` | 暗色卡片背景 |
| `bg-gray-50` | `bg-surface-secondary` | 暗色页面背景 |
| `bg-gray-100` | `bg-surface-tertiary` | 暗色占位区 |
| `text-gray-900` | `text-text-primary` | 暗色亮文字 |
| `text-gray-700` | `text-text-primary` | 同上 |
| `text-gray-600` | `text-text-secondary` | 暗色次级文字 |
| `text-gray-500` | `text-text-quaternary` | 暗色浅文字 |
| `text-gray-400` | `text-text-tertiary` | 暗色提示文字 |
| `border-gray-200` | `border-border` | 暗色边框 |
| `bg-blue-600` | `bg-accent` | 暗色按钮 |
| `hover:bg-blue-700` | `hover:bg-accent-hover` | 暗色悬停 |
| `text-blue-600` | `text-accent` | 暗色链接 |
| `bg-blue-100` | `bg-accent-bg` | 暗色图标背景 |
| `focus:ring-blue-500` | `focus:ring-accent` | 暗色聚焦环 |
| `hover:text-blue-600` | `hover:text-accent` | 暗色链接悬停 |
| `hover:text-blue-700` | `hover:text-accent-hover` | 暗色链接悬停 |
| `hover:bg-gray-50` | `hover:bg-surface-tertiary` | 暗色悬停背景 |
| `hover:bg-gray-100` | `hover:bg-surface-tertiary` | 暗色悬停背景 |
| `text-red-600` | `text-danger` | 暗色红色文字 |
| `bg-red-50` | `bg-danger-bg` | 暗色红色背景 |
| `text-green-600` | `text-success` | 暗色绿色文字 |
| `bg-green-50` | `bg-success-bg` | 暗色绿色背景 |
| `bg-green-100` | `bg-success-bg` | 暗色绿色背景 |
| `text-orange-500` | `text-warning` | 暗色橙色文字 |
| `bg-black/40` | `bg-overlay` | 暗色遮罩 |
| `bg-black/60` | `bg-overlay-strong` | 暗色遮罩加强 |
| `text-white`（在有色背景上） | 保留 `text-white` | 不变（已适配底色） |
| `group-hover:text-blue-600` | `group-hover:text-accent` | 暗色悬停 |

### 暗色模式额外覆盖

以下元素在暗色模式下需要额外处理（在 `globals.css` 的 `.dark` 块中直接设置）：

```css
.dark {
  img { opacity: 0.9; transition: opacity 0.3s; }
  img:hover { opacity: 1; }
}
```

## 不需要修改的文件

- `src/middleware.ts` — 纯逻辑，无颜色类
- `src/lib/*` — 工具函数，无颜色类
- `src/types/*` — 类型定义
- `src/app/api/*` — API 路由，无颜色类
- `src/app/auth/layout.tsx` — 仅包含重定向逻辑，无颜色类

## 平滑过渡

在 `globals.css` 中为 `body` 或所有元素添加过渡，避免主题切换时跳变：

```css
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

## 验证方式

1. 开发服务器运行后，查看亮色模式下视觉与修改前完全一致
2. 点击 Header 中的切换按钮，切换为暗色模式
3. 刷新页面，主题保持（localStorage 持久化）
4. 清除 localStorage，默认跟随系统 `prefers-color-scheme`
5. 依次检查所有页面：首页、商品详情、登录、注册
6. 按钮、链接、输入框聚焦环、边框、遮罩层均正常显示
