# yiliminav API 文档

## 基础信息

| 项目 | 值 |
|------|-----|
| 基础URL | `https://nav.361026.xyz` |
| API 前缀 | `/api` |
| 认证方式 | Bearer Token |
| 响应格式 | JSON |

---

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

### 分页响应

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

---

## 认证接口

### 登录

**POST** `/api/auth/login`

**请求体**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "用户名"
    }
  }
}
```

### 注册

**POST** `/api/auth/register`

**请求体**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}
```

---

## 数据接口

### 获取用户数据

**GET** `/api/bootstrap`

**Headers**:

```
Authorization: Bearer <token>
```

**响应**:

```json
{
  "success": true,
  "data": {
    "user": {},
    "categories": [],
    "links": [],
    "settings": {}
  }
}
```

### 更新数据

**POST** `/api/update`

**Headers**:

```
Authorization: Bearer <token>
```

**请求体**:

```json
{
  "type": "category|link|setting",
  "action": "create|update|delete",
  "data": {}
}
```

---

## AI 接口

### AI 推荐网站

**POST** `/api/recommend`

**描述**: 根据用户需求推荐合适的网站分类

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:

```json
{
  "query": "我想找一些编程教程网站",
  "categories": ["编程", "学习", "工具", "设计"]
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "recommendation": {
      "category": "编程",
      "confidence": 0.95,
      "reason": "用户提到编程教程，与编程分类高度相关"
    },
    "suggestedLinks": [
      {
        "title": "MDN Web Docs",
        "url": "https://developer.mozilla.org",
        "reason": "最权威的Web开发文档"
      }
    ]
  }
}
```

---

### 自然语言搜索

**POST** `/api/search`

**描述**: 使用自然语言搜索书签

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:

```json
{
  "query": "找一些好看的设计素材网站",
  "limit": 5
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "link_123",
        "title": "Unsplash",
        "url": "https://unsplash.com",
        "category": "设计",
        "score": 0.92,
        "reason": "高质量免费图片素材网站"
      }
    ]
  }
}
```

---

### AI 自动归类

**POST** `/api/classify`

**描述**: 自动判断链接应该归到哪个分类

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:

```json
{
  "url": "https://github.com",
  "title": "GitHub",
  "existingCategories": ["编程", "工具", "设计", "学习"]
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "category": "编程",
    "confidence": 0.98,
    "reason": "GitHub是全球最大的代码托管平台"
  }
}
```

---

### AI 对话

**POST** `/api/chat`

**描述**: 与 AI 助手对话，找网站或问问题

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:

```json
{
  "message": "有什么好的前端学习网站推荐吗？",
  "history": [
    {
      "role": "user",
      "content": "你好"
    },
    {
      "role": "assistant",
      "content": "你好！有什么可以帮你的吗？"
    }
  ]
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "reply": "当然可以！以下是几个优质的前端学习网站：\n\n1. **MDN Web Docs** - 最权威的Web开发文档\n2. **freeCodeCamp** - 免费的学习平台\n3. **Vue.js 文档** - Vue官方文档\n\n需要我帮你添加到导航吗？",
    "suggestions": [
      {
        "type": "link",
        "title": "MDN Web Docs",
        "url": "https://developer.mozilla.org"
      }
    ]
  }
}
```

---

### AI 封面生成

**POST** `/api/cover`

**描述**: 为分类生成 AI 封面图

**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:

```json
{
  "category": "编程",
  "style": "modern" // modern | minimal | colorful
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "coverUrl": "https://nav.361026.xyz/covers/programming-abc123.jpg",
    "thumbnailUrl": "https://nav.361026.xyz/covers/programming-abc123-thumb.jpg"
  }
}
```

**注意**: 封面图存储在 R2，通过 CDN 访问

---

## 公开接口

### 获取今日名言

**GET** `/api/quote`

**描述**: 获取每日名言（无需认证）

**响应**:

```json
{
  "success": true,
  "data": {
    "id": "quote_123",
    "content": "代码是写给人看的，顺便能在机器上运行。",
    "author": "Donald Knuth",
    "category": "编程"
  }
}
```

---

### 获取诗词

**GET** `/api/poem`

**描述**: 获取随机诗词（无需认证）

**响应**:

```json
{
  "success": true,
  "data": {
    "content": "明月几时有，把酒问青天。",
    "author": "苏轼",
    "title": "水调歌头",
    "dynasty": "宋"
  }
}
```

---

### 健康检查

**GET** `/api/health`

**响应**:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "timestamp": 1701234567890
  }
}
```

---

## 错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|-------------|------|
| UNAUTHORIZED | 401 | 未授权 |
| FORBIDDEN | 403 | 禁止访问 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 422 | 参数验证失败 |
| RATE_LIMIT | 429 | 请求过于频繁 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| AI_ERROR | 502 | AI 服务错误 |

---

## 限流规则

| 接口 | 限制 |
|------|------|
| 公开接口 | 60 次/分钟 |
| 认证接口 | 30 次/分钟 |
| AI 接口 | 10 次/分钟 |

---

## 请求示例

### cURL

```bash
# 获取名言
curl -X GET https://nav.361026.xyz/api/quote

# AI 推荐
curl -X POST https://nav.361026.xyz/api/recommend \
  -H "Authorization: Bearer YOUR_TOKEN" \
 -Type: application/json" \
  - -H "Contentd '{"query": "编程教程", "categories": ["编程", "学习"]}'
```

### JavaScript

```javascript
// 获取名言
const quote = await fetch('https://nav.361026.xyz/api/quote')
  .then(r => r.json());

// AI 推荐
const recommend = await fetch('https://nav.361026.xyz/api/recommend', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: '编程教程',
    categories: ['编程', '学习']
  })
}).then(r => r.json());
```
