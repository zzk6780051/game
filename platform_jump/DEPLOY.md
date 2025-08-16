# 部署到GitHub Pages

本指南将帮助您将平台跳跃游戏部署到GitHub Pages。

## 步骤1：创建GitHub仓库

1. 登录到您的GitHub账户
2. 点击右上角的"+"号，选择"New repository"
3. 为仓库命名（例如：platform-jumper）
4. 将仓库设置为Public（GitHub Pages需要Public仓库）
5. 不要初始化README、.gitignore或license
6. 点击"Create repository"

## 步骤2：推送代码到GitHub

1. 在本地项目目录中打开终端或命令提示符
2. 初始化git仓库：
   ```
   git init
   ```
3. 添加所有文件：
   ```
   git add .
   ```
4. 提交更改：
   ```
   git commit -m "Initial commit"
   ```
5. 添加远程仓库（将`username`替换为您的GitHub用户名）：
   ```
   git remote add origin https://github.com/username/platform-jumper.git
   ```
6. 推送到GitHub：
   ```
   git push -u origin main
   ```

## 步骤3：启用GitHub Pages

1. 在GitHub上访问您的仓库
2. 点击"Settings"选项卡
3. 向下滚动到"Pages"部分
4. 在"Source"下拉菜单中选择"main"分支
5. 点击"Save"
6. 等待几分钟让GitHub Pages构建完成
7. 您将在"Pages"部分看到您的网站URL

## 步骤4：访问您的游戏

部署完成后，您可以通过以下URL访问游戏：
```
https://username.github.io/platform-jumper/
```

将`username`替换为您的GitHub用户名，`platform-jumper`替换为您仓库的名称。

## 更新部署

要更新您的游戏：

1. 在本地进行更改
2. 提交更改：
   ```
   git add .
   git commit -m "Update game"
   ```
3. 推送到GitHub：
   ```
   git push
   ```

GitHub Pages会自动重新部署您的网站。