# GitHub Pages 部署指南

## 🚀 快速部署步骤

### 1. 创建 GitHub 仓库
```bash
# 如果还没有创建仓库，在 GitHub 上创建一个新仓库
# 仓库名可以是任意名称，如: tank-battle-game
```

### 2. 推送代码到仓库
```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/w2233540467/tank-battle-game.git

# 添加所有文件
git add .

# 提交代码
git commit -m "Add tank battle game"

# 推送到主分支
git push -u origin main
```

### 3. 启用 GitHub Pages
1. 进入你的 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到并点击 **Pages**
4. 在 **Source** 部分选择 **GitHub Actions**
5. 保存设置

### 4. 自动部署
- GitHub Actions 会自动检测到 `.github/workflows/deploy.yml` 文件
- 每次推送到 `main` 或 `master` 分支都会触发自动部署
- 部署完成后，游戏将在 `https://w2233540467.github.io/仓库名` 访问

## 📁 项目文件结构

```
tank-battle-game/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 工作流程
├── .nojekyll                   # 禁用 Jekyll 处理
├── index.html                  # 游戏主页面
├── style.css                   # 游戏样式
├── game.js                     # 游戏逻辑
├── README.md                   # 项目说明
└── DEPLOYMENT.md              # 部署指南
```

## 🔧 配置文件说明

### `.github/workflows/deploy.yml`
- GitHub Actions 工作流程配置
- 自动构建和部署到 GitHub Pages
- 支持 `main` 和 `master` 分支

### `.nojekyll`
- 告诉 GitHub Pages 不要使用 Jekyll 处理文件
- 确保所有静态文件正确加载

## 🌐 访问方式

### 如果仓库名为用户名.github.io
```
https://w2233540467.github.io/
```

### 如果仓库名为其他名称（如 tank-battle-game）
```
https://w2233540467.github.io/tank-battle-game/
```

## 🐛 常见问题

### 1. 页面显示 404
- 确保仓库是公开的
- 检查 GitHub Pages 是否已启用
- 确认分支名称是 `main` 或 `master`

### 2. CSS/JS 文件加载失败
- 检查文件路径是否使用相对路径
- 确保 `.nojekyll` 文件存在

### 3. 部署失败
- 检查 GitHub Actions 日志
- 确保仓库有 Pages 写入权限

## 📱 移动设备优化

游戏已经包含响应式设计，在移动设备上也能良好运行：
- 自适应屏幕尺寸
- 触摸友好的界面
- 优化的控制方式

## 🔄 更新部署

要更新游戏：
```bash
# 修改代码后
git add .
git commit -m "Update game features"
git push origin main
```

GitHub Actions 会自动重新部署更新的版本。

## 📊 性能监控

可以使用以下工具监控网站性能：
- Google PageSpeed Insights
- GTmetrix
- WebPageTest

---

**部署完成后，你的坦克大战游戏就可以通过网络访问了！** 🎮