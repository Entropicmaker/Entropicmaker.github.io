# 选择性失忆的博客

一个面向长期知识积累的中文静态博客，使用 Astro、TypeScript、Markdown / MDX 与 Content Collections 构建。无需数据库或后台，推送到 GitHub 的 `main` 分支后可自动发布到 GitHub Pages。

## 已实现功能

- 首页、文章、分类、标签、归档、项目、关于、搜索和自定义 404 页面；
- “一个主分类 + 可选子分类 + 多标签”的文章模型；
- 生产环境自动隐藏 `draft: true` 的文章；
- Pagefind 构建时静态搜索，无数据库和第三方搜索服务；
- 自动文章目录、阅读进度、上一篇 / 下一篇、相关文章与预计阅读时间；
- Shiki 代码高亮、KaTeX 数学公式、图注与表格样式；
- 浅色 / 深色模式、响应式布局和键盘可访问导航；
- 页面 SEO、Open Graph、RSS、sitemap 与 robots.txt；
- GitHub Pages 根路径和普通项目子路径自动适配；
- GitHub Actions 最小权限部署与 Dependabot 更新检查。

## 本地使用

需要 Node.js 22 或更高版本，以及 npm。

```bash
npm install
npm run dev
```

开发服务器通常位于 `http://localhost:4321`。常用命令：

```bash
npm run check          # Astro 类型与内容检查
npm run format:check   # 检查格式
npm run build          # 生产构建并生成 Pagefind 搜索索引
npm run preview        # 本地预览生产构建
```

## 新增文章

1. 复制 `templates/post-template.md` 到 `src/content/posts/`；
2. 把文件名改成稳定的英文短链接，例如 `urban-heat-island.md`；
3. 填写 frontmatter 与正文；
4. 完成前保持 `draft: true`，准备发布时改为 `false`；
5. 运行 `npm run check` 与 `npm run build`。

一级分类只能是：

- `geography`：地理科学；
- `computer-science`：计算机科学；
- `geocomputing`：交叉研究 / 地理计算。

`readingTime` 可以省略，构建时会根据中英文正文估算。Markdown 中不要写不受信任的原始 HTML；站点没有接收外部用户内容的入口。

## 替换个人资料与站点信息

- 站点名称、作者、简介、邮箱与 GitHub 地址：`src/data/site.ts`；
- 社交分享图：`public/og.png`；
- 分类说明：`src/data/categories.ts`；
- 项目卡片：`src/data/projects.ts`；
- 首页头像占位区：`src/pages/index.astro` 中的 `.avatar-panel`。如换成图片，建议放入 `src/assets/` 并使用 Astro 的 `<Image />` 组件，同时填写准确的 `alt`；
- 颜色与排版：`src/styles/global.css` 顶部的 CSS 变量。

GitHub 用户名和仓库名不需要写入多个文件。部署工作流根据 `GITHUB_REPOSITORY_OWNER` 和仓库名自动计算站点地址与子路径；配置自定义域名时，在仓库 **Settings → Secrets and variables → Actions → Variables** 中创建 `SITE_URL`，值为完整的 HTTPS 地址。本地测试特殊路径时可复制 `.env.example` 为 `.env` 并修改：

```dotenv
PUBLIC_SITE_URL=https://yourname.github.io
PUBLIC_BASE_PATH=/your-repository/
```

用户主页仓库的 `PUBLIC_BASE_PATH` 使用 `/`。

## 发布到 GitHub Pages

### 方案 A：用户主页仓库

1. 在 GitHub 创建公开仓库，名称必须是 `<你的用户名>.github.io`；
2. 不勾选自动创建 README，避免与本地文件冲突；
3. 在本项目目录执行：

   ```bash
   git init
   git add .
   git commit -m "初始化个人知识博客"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<你的用户名>.github.io.git
   git push -u origin main
   ```

4. 打开仓库 **Settings → Pages**；
5. 在 **Build and deployment → Source** 选择 **GitHub Actions**；
6. 等待仓库的 **Actions** 页面显示部署完成，访问 `https://<你的用户名>.github.io/`。

### 方案 B：普通项目仓库

步骤相同，但仓库名可以自定义，例如 `blog`。部署地址将自动变为 `https://<你的用户名>.github.io/blog/`，不需要修改代码中的链接。

如果仓库已经初始化过 Git，请不要重复运行 `git init`。本项目不会自动创建远程仓库、推送代码或修改 GitHub 设置。

### 绑定自定义域名

1. 先在 GitHub 仓库 **Settings → Pages → Custom domain** 中填写域名；
2. 在域名服务商处配置根域名的 `A` 记录，或为子域名配置指向 `<你的用户名>.github.io` 的 `CNAME`；
3. 在仓库 Actions Variables 中创建 `SITE_URL=https://你的域名`；
4. DNS 生效后开启 **Enforce HTTPS**，再重新运行部署工作流；
5. 建议在 GitHub 个人设置的 Pages 页面验证域名，避免域名接管风险。

本项目通过自定义 GitHub Actions 工作流部署，因此无需创建 `CNAME` 文件。

## 内容与安全提醒

**GitHub Pages 是公开网页。文章、附件、截图以及 Git 历史都不能包含密码、Token、API Key、精确住址、未公开研究数据或其他敏感信息。** 即使后来删除文件，内容仍可能存在于 Git 历史中。

- `.env` 与本地环境文件已加入 `.gitignore`，但提交前仍应检查 `git diff --staged`；
- 不要把真实密钥写进 `.env.example`、Markdown 或 Actions 工作流；
- 所有外部资源应使用 HTTPS；
- 第一版没有登录、数据库、后端 API、表单、统计、广告或外部评论脚本；
- Giscus 环境变量仅作预留，启用前请核对公开仓库权限与隐私影响。

## 核心目录

```text
src/
├── components/          可复用界面组件
├── content/posts/       Markdown / MDX 文章
├── content.config.ts    Content Collections + Zod 模型
├── data/                站点、分类与项目数据
├── layouts/             页面与文章布局
├── pages/               全部页面路由、RSS
├── styles/              全局视觉样式
└── utils/               排序、标签、阅读时间等集中逻辑
public/                   robots.txt 等静态资源
templates/                新文章模板
.github/workflows/        GitHub Pages 部署工作流
```

## 后续可选扩展

- 配置 Giscus 公开评论；
- 增加文章系列聚合页；
- 为真实项目添加仓库链接、演示链接和截图；
- 使用 Astro `<Image />` 增加响应式封面图；
- 添加基于 Git 历史的文章修改记录。
