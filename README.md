# Bob Lee · 个人主页

复刻 [ky.fyi](https://ky.fyi) 的「玩具钢琴」风格：浅米白底、两行带下划线的大标题、一台圆角黑色小电子琴（绿色像素屏），往下是卡片。内容全部来自本人提供的信息。

## 本地查看

```bash
pnpm install
pnpm dev          # 打开 http://localhost:5173
```

想看和线上一模一样的打包结果：

```bash
pnpm build && pnpm preview   # 打开 http://localhost:4173
```

## 玩法

- 点屏幕上的 **PLAY** 开启声音（浏览器要求先有一次点击才能发声）。
- 点琴键，或按住滑过去；键盘 `A S D F G H J K L ;` 是白键，`W E T Y U O P` 是黑键。
- 点屏幕两侧的箭头，或按 `←` `→` 换音色：钢琴 / 八音盒 / 8-bit / 竖琴 / 铃 / Miku 声线。所有音色都由 WebAudio 现场合成，没有音频文件。
- 右上角切换浅色 / 深色，会记住你的选择。

## 技术栈

Vite · React 19 · TypeScript · Tailwind CSS v4 · [Motion](https://motion.dev)（动效）· shadcn/ui（Button、Tooltip、Sonner）· Radix UI · lucide-react · Magic UI 的 Border Beam / Dot Pattern（移植）· Libre Franklin + JetBrains Mono（字体随包，离线可用）。

## 部署到 GitHub Pages

1. 把这个文件夹推到 GitHub 仓库的 `main` 分支。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。
3. 之后每次推送 `main`，`.github/workflows/deploy.yml` 会自动构建并发布。

构建时 `base` 用的是相对路径 `./`，所以无论发布在 `用户名.github.io` 还是 `用户名.github.io/仓库名/` 都能正常加载。

## 修改内容

文字都在 `src/components/` 里：标题在 `Hero.tsx`，卡片在 `Cards.tsx`，关于在 `About.tsx`，邮箱在 `Contact.tsx`。
