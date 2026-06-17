# Mini Mall — 微型电商项目

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | **16.2.9** | 全栈框架 (App Router + Server Actions + Turbopack) |
| React | **19.2.4** | UI 库 |
| TypeScript | **5.x** | 类型安全 |
| Prisma | **5.22.0** | ORM |
| SQLite | — | 数据库（嵌入式，零配置） |
| Tailwind CSS | **4.x** | 样式 |
| Auth.js (NextAuth) | **5.0.0-beta.31** | 认证（Credentials Provider + JWT） |
| bcryptjs | **3.x** | 密码哈希 |
| React Hot Toast | **2.x** | 通知提示 |
| Lucide React | **1.x** | 图标库 |

## 项目结构

```
mini-mall/
├── prisma/
│   ├── schema.prisma          # 数据库模型 (6 models)
│   ├── seed.ts                # 种子数据
│   ├── dev.db                 # SQLite 数据库文件
│   └── migrations/            # 数据库迁移
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   ├── globals.css        # Tailwind 全局样式
│   │   ├── products/          # 商品浏览
│   │   │   ├── page.tsx       # 商品列表（搜索+筛选）
│   │   │   └── [id]/page.tsx  # 商品详情
│   │   ├── cart/page.tsx      # 购物车
│   │   ├── orders/            # 订单管理
│   │   ├── auth/              # 登录/注册
│   │   ├── admin/             # 后台管理
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── components/
│   │   ├── ui/                # 通用 UI 组件
│   │   ├── layout/            # 布局组件
│   │   ├── product/           # 商品组件
│   │   ├── cart/              # 购物车组件
│   │   └── order/             # 订单组件
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 客户端单例
│   │   ├── auth.ts            # Auth.js 配置
│   │   └── utils.ts           # 工具函数
│   ├── actions/               # Server Actions
│   │   ├── product.ts
│   │   ├── cart.ts
│   │   ├── order.ts
│   │   └── category.ts
│   └── types/index.ts         # 类型定义
├── .env
├── package.json
├── next.config.ts
└── tsconfig.json
```

## 数据库模型 (6 个)

- **User** — 用户 (name, email, password, role: user|admin)
- **Category** — 分类 (name, slug)
- **Product** — 商品 (name, slug, description, price, imageUrl, stock, categoryId)
- **CartItem** — 购物车项 (userId, productId, quantity — 联合唯一)
- **Order** — 订单 (userId, status: pending|paid|shipped|delivered|cancelled, total)
- **OrderItem** — 订单项 (orderId, productId, quantity, price — 价格快照)

## 页面路由

### 前台
| 路径 | 说明 |
|------|------|
| `/` | 首页 |
| `/products` | 商品列表（搜索 + 分类筛选） |
| `/products/[id]` | 商品详情 |
| `/cart` | 购物车 (需登录) |
| `/orders` | 我的订单 (需登录) |
| `/orders/[id]` | 订单详情 (需登录) |
| `/auth/login` | 登录 |
| `/auth/register` | 注册 |

### 后台 (admin 角色)
| 路径 | 说明 |
|------|------|
| `/admin` | 仪表盘 |
| `/admin/products` | 商品管理 CRUD |
| `/admin/products/new` | 新增商品 |
| `/admin/products/[id]/edit` | 编辑商品 |
| `/admin/categories` | 分类管理 |
| `/admin/orders` | 订单管理 |

## 关键设计决策

1. **认证**: Auth.js v5 + Credentials Provider + JWT session
2. **购物车**: 数据库持久化（CartItem 表），Server Actions 操作
3. **搜索筛选**: URL query params (`?category=x&q=keyword`) + Prisma where
4. **模拟支付**: pending → paid，不接真实网关
5. **权限**: middleware 保护 `/admin/*`，页面内二次校验 role
6. **数据流**: Server Components 直连 Prisma → Server Actions 写操作

## 常用命令

```bash
npm run dev           # 启动开发服务器 (http://localhost:3000)
npm run build         # 构建生产版本
npm run seed          # 运行种子数据
npm run db:studio     # 启动 Prisma Studio
npm run db:migrate    # 创建数据库迁移
npm run db:push       # 直接同步 Schema 到数据库
```

## 种子数据账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| Admin | admin@minimall.com | admin123 |
| User | user@test.com | user123 |

## 开发规范

- 使用 App Router 和 Server Components 优先
- Server Actions 统一放在 `src/actions/` 目录
- UI 组件使用 Tailwind CSS 4 + shadcn/ui 风格
- 数据校验使用 zod（类型从 schema 推导）
- 所有类型定义放在 `src/types/`
- 使用 `@/` 路径别名引用 `src/` 目录

## 实现阶段

- [x] Phase 1: 项目初始化 + 数据库 (Next.js + Prisma + SQLite + 种子数据)
- [ ] Phase 2: 认证系统 (Auth.js + 登录/注册 + middleware)
- [ ] Phase 3: 前台核心功能 (商品浏览 + 购物车 + 下单)
- [ ] Phase 4: 后台管理 (商品/分类/订单 CRUD)
- [ ] Phase 5: 收尾优化 (UI 打磨 + 错误处理 + 响应式)

<!-- superpowers-zh:begin (do not edit between these markers) -->
# Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（20 个 skills）。

## 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **测试先于实现** — 写代码前先写测试（TDD）
4. **验证先于完成** — 声称完成前必须运行验证命令

## 可用 Skills

Skills 位于 `.claude/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。在实现之前先探索用户意图、需求和设计。
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **dispatching-parallel-agents**: 当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **executing-plans**: 当你有一份书面实现计划需要在单独的会话中执行，并设有审查检查点时使用
- **finishing-a-development-branch**: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 当在当前会话中执行包含独立任务的实现计划时使用
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 在实现任何功能或修复 bug 时使用，在编写实现代码之前
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发，或在执行实现计划之前使用——通过原生工具或 git worktree 回退机制确保隔离工作区存在
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在宣称工作完成、已修复或测试通过之前使用，在提交或创建 PR 之前——必须运行验证命令并确认输出后才能声称成功；始终用证据支撑断言
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 当你有规格说明或需求用于多步骤任务时使用，在动手写代码之前
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

## 如何使用

当任务匹配某个 skill 时，使用 `Skill` 工具加载对应 skill 并严格遵循其流程。绝不要用 Read 工具读取 SKILL.md 文件。

如果你认为哪怕只有 1% 的可能性某个 skill 适用于你正在做的事情，你必须调用该 skill 检查。
<!-- superpowers-zh:end -->
