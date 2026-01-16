# Zeabur 部署指南

本指南将指导您如何在 [Zeabur](https://zeabur.com) 上部署 tgstate-python。

## 准备工作

1. 拥有一个 GitHub 账号。
2. 拥有一个 Zeabur 账号。
3. Fork 本仓库到您的 GitHub 账户：[点击 Fork](https://github.com/adminlove520/tgstate-python/fork)

## 部署步骤

### 1. 创建服务
1. 登录 Zeabur 控制台。
2. 点击 **Create Project** (新建项目) 或进入现有项目。
3. 点击 **Deploy New Service** (部署新服务) -> 选择 **Git**。
4. 搜索并选择您刚刚 Fork 的 `tgstate-python` 仓库。
5. Zeabur 会自动识别 Dockerfile 并开始构建。

### 2. 配置环境变量
部署初始化时可能会失败，因为缺少必要的环境变量。请进入服务的 **Variables** (环境变量) 页面，添加以下变量：

| 变量名 | 示例值 | 说明 |
| :--- | :--- | :--- |
| `BOT_TOKEN` | `123456789:AAH...` | 您的 Telegram Bot Token |
| `CHANNEL_NAME` | `-100123456789` | 您的频道 ID (推荐用 ID) |
| `PORT` | `8000` | 容器端口 (通常无需手动改，Zeabur 会自动识别 EXPOSE) |

### 3. 配置持久化存储 (重要)
为了防止重启服务后丢失**管理员密码**和**文件索引**，必须配置持久化存储。

1. 进入服务的 **Settings** (设置) 页面。
2. 找到 **Volumes** (存储卷) 部分。
3. 点击 **Add Volume** (添加存储卷)。
4. 填写挂载路径 (Mount Path)：`/app/data`
   > **注意**：如果不挂载 `/app/data`，每次重启后都会丢失之前的配置和文件记录！

### 4. 绑定域名 (可选)
1. 在 **Networking** (网络) 部分，您可以生成一个 `zeabur.app` 的子域名，或者绑定您自己的自定义域名。
2. 这个域名即为您的 `BASE_URL`。

### 5. 重启服务
完成上述配置后，点击 **Redeploy** (重新部署) 确保所有设置生效。

---

## 验证
访问您绑定的域名，如果出现密码引导页，说明部署成功。
