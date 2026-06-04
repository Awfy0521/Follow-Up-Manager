# 跟进记录功能设计文档

## Context

基于两张需求截图，需要在现有微信小程序框架上实现"跟进记录列表"和"添加跟进记录"功能。项目当前为纯原生微信小程序（WXML/WXSS/JS），无 Vue 依赖。用户选择原生开发 + 本地存储方案，并要求使用黑灰白配色，将复杂任务抽象为可执行的 skill（模块化架构）。

---

## 1. 配色方案

采用黑灰白三色系：

| 用途 | 色值 | 说明 |
|------|------|------|
| 主背景 | `#FFFFFF` | 页面背景 |
| 次背景 | `#F5F5F5` | 卡片/区块背景 |
| 主文字 | `#333333` | 标题、正文 |
| 次文字 | `#999999` | 辅助信息、日期 |
| 分割线 | `#E5E5E5` | 边框、分割线 |
| 主按钮 | `#333333` | 保存等主操作按钮 |
| 次按钮 | `#FFFFFF` | 取消等次操作按钮（带边框） |
| 强调色 | `#666666` | tab 选中态、图标 |

---

## 2. 页面结构

新增 2 个页面，注册到 `app.json`：

```
pages/
├── followUpList/        # 跟进记录列表页
│   ├── followUpList.js
│   ├── followUpList.json
│   ├── followUpList.wxml
│   └── followUpList.wxss
└── followUpAdd/         # 添加跟进记录页
    ├── followUpAdd.js
    ├── followUpAdd.json
    ├── followUpAdd.wxml
    └── followUpAdd.wxss
```

导航关系：
```
index → followUpList → followUpAdd
```

---

## 3. Skill 模块化架构

将复杂任务拆解为可复用的 skill 模块，放在 `utils/skills/` 目录下：

### 3.1 storage-skill.js — 数据存储 Skill

职责：封装所有本地存储操作，提供统一的数据访问接口。

```
getRecords()        → Array  获取所有跟进记录
addRecord(data)     → void   新增一条记录
deleteRecord(id)    → void   删除指定记录
initMockData()      → void   初始化 mock 数据（仅首次）
generateId()        → Number 生成唯一 ID
```

### 3.2 format-skill.js — 格式化 Skill

职责：统一处理日期、文本等格式化操作。

```
formatDate(date)       → String  格式化日期为 MM-DD
formatDateTime(date)   → String  格式化为 YYYY-MM-DD HH:mm:ss
truncateText(text, maxLen) → String 截断文本并添加省略号
```

### 3.3 validate-skill.js — 表单校验 Skill

职责：校验表单数据，返回校验结果。

```
validateRecord(data) → { valid: Boolean, errors: Array }
```

校验规则：
- 沟通主题：必填，1-50 字符
- 沟通详情：必填
- 下次沟通时间：必填
- 下次沟通内容：可选

### 3.4 mock-skill.js — Mock 数据 Skill

职责：提供初始 mock 数据，模拟真实业务场景。

提供 3 条初始记录：
1. 星巴克咖啡商谈细节 — 沟通投资细节，06-09
2. 跨赴科技办公室深入了解 — 深入沟通项目，了解产品和业务的进展，打算投一个亿，06-08
3. 奇迹 DemoDay — 第一次在 DemoDay 上接触，印象不错，06-07

---

## 4. 页面设计

### 4.1 跟进记录列表页 (followUpList)

**布局：**
- 顶部 tab 栏：「项目详情」/「跟进记录 (N条)」，选中态带下划线
- 记录卡片列表：每条显示标题、内容摘要、日期
- 右下角圆形 "+" 浮动按钮
- 下拉刷新支持

**交互：**
- 下拉刷新：重新加载数据，显示刷新动画
- 点击 "+" 跳转添加页
- 页面显示时自动刷新列表（从本地缓存读取）

### 4.2 添加跟进记录页 (followUpAdd)

**表单字段：**

| 字段 | 组件 | 必填 |
|------|------|------|
| 沟通主题 | input | 是 |
| 沟通详情 | textarea | 是 |
| 下次沟通时间 | date-picker | 是 |
| 下次沟通内容 | textarea | 否 |

**按钮：**
- 保存（黑色背景白字）：校验 → 存储 → 返回列表
- 取消（白色背景黑边框）：直接返回

**交互：**
- 表单校验失败时显示错误提示
- 保存成功后 toast 提示并自动返回列表页

---

## 5. 数据流

```
用户操作 → 页面事件 → Skill 模块 → 本地存储 → 页面刷新
```

具体流程：
1. 列表页 `onLoad` / `onShow` → 调用 `storage-skill.getRecords()` → 渲染列表
2. 用户点击 "+" → `wx.navigateTo` 跳转添加页
3. 用户填写表单 → 点击保存 → `validate-skill.validateRecord()` 校验
4. 校验通过 → `storage-skill.addRecord()` 存储 → `wx.navigateBack()` 返回
5. 列表页 `onShow` 触发 → 重新加载数据

---

## 6. 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `app.json` | 修改 | 注册新页面路径 |
| `utils/skills/storage-skill.js` | 新建 | 数据存储模块 |
| `utils/skills/format-skill.js` | 新建 | 格式化模块 |
| `utils/skills/validate-skill.js` | 新建 | 表单校验模块 |
| `utils/skills/mock-skill.js` | 新建 | Mock 数据模块 |
| `pages/followUpList/*` | 新建 | 列表页 4 个文件 |
| `pages/followUpAdd/*` | 新建 | 添加页 4 个文件 |
| `app.wxss` | 修改 | 添加全局样式变量 |

---

## 7. 验证方式

1. 在微信开发者工具中编译运行
2. 首次进入列表页，验证 3 条 mock 数据正确显示
3. 点击 "+" 进入添加页，填写表单并保存
4. 返回列表页，验证新记录已添加
5. 测试下拉刷新功能
6. 测试表单校验（空提交、超长输入）
7. 验证黑灰白配色在各页面一致
