# yiliminav 通过Cloudflare Dashboard部署指南

## 一、前置准备

- [ ] GitHub仓库已创建：https://github.com/chanriver/yiliminav
- [ ] Cloudflare 账号
- [ ] MiniMax API Key

---

## 二、一键部署（推荐）

### 2.1 连接GitHub

1. 打开 Cloudflare Dashboard：https://dash.cloudflare.com
2. 登录你的账号
3. 点击左侧 **Workers 和 Pages** → **概述**
4. 点击 **创建应用程序**
5. 选择 **连接到 Git**
6. 点击 **授权** 授权 GitHub
7. 选择仓库 `chanriver/yiliminav`

### 2.2 配置部署

在设置页面填写：

| 配置项 | 值 |
|--------|-----|
| 生产分支 | `master` |
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |

点击 **保存并部署**

---

## 三、配置环境变量

### 3.1 创建KV命名空间

1. 回到 Cloudflare Dashboard
2. 点击左侧 **Workers** → **KV**
3. 点击 **创建命名空间**
4. 填写：
   - 名称：`QUOTE_KV` → 点击 **添加**
   - 名称：`POEM_KV` → 点击 **添加**
5. 记录下生成的 ID

### 3.2 配置变量

1. 回到 Pages 项目
2. 点击 **设置** → **环境变量**
3. 点击 **添加变量**
4. 填写：
   - 变量名：`MINIMAX_API_KEY`
   - 值：你的 MiniMax API Key（从 https://platform.minimax.io 获取）
5. 点击 **保存**

### 3.3 配置KV绑定

1. 点击 **设置** → **函数** → **绑定**
2. 点击 **添加绑定**
3. 填写：

**第一个绑定**：
- 变量名称：`QUOTE_KV`
- KV命名空间：选择 `QUOTE_KV`

**第二个绑定**：
- 变量名称：`POEM_KV`
- KV命名空间：选择 `POEM_KV`

4. 点击 **保存并部署**

---

## 四、绑定域名

### 4.1 添加自定义域名

1. 在 Pages 项目中，点击 **自定义域**
2. 点击 **设置自定义域**
3. 输入：`nav.361026.xyz`
4. 点击 **激活域**

### 4.2 DNS配置

如果域名不在Cloudflare管理：
1. 登录域名注册商
2. 添加DNS记录：
   - 类型：`CNAME`
   - 名称：`nav`
   - 值：`yiliminav.pages.dev`
3. 等待生效（通常几分钟）

---

## 五、验证部署

访问 https://nav.361026.xyz 检查：

| 功能 | 检查 |
|------|------|
| 首页加载 | 搜索框显示正常 |
| 名人名言 | 搜索框下方显示名言 |
| 时钟 | 左侧显示时间 |
| 诗词 | 右侧显示诗词 |
| AI助手 | 点击星星图标可对话 |

---

## 六、自动部署

连接GitHub后，以后的部署流程：

1. 修改代码
2. 提交并推送到GitHub：
```bash
git add .
git commit -m "feat: 更新内容"
git push
```
3. Cloudflare会自动构建部署

---

## 七、常见问题

### Q: 部署失败怎么办？
- 点击部署记录查看错误日志
- 常见问题：构建命令错误、依赖未安装

### Q: 如何重新部署？
- 在 Pages 项目点击 **重新部署**

### Q: 环境变量在哪看？
- 设置 → 环境变量

### Q: KV在哪看？
- Workers → KV → 你的命名空间
