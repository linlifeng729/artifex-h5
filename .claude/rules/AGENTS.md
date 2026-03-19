# 全局规则系统

> L1: 全局规则入口 - 适用于所有代码的跨领域规则

<rules_system priority="1">

## Available Rules

<!-- RULES_TABLE_START -->
<usage>
全局规则自动应用于所有匹配的文件路径。这些规则是跨领域的，适用于整个项目。

How to use rules:

- Rules are automatically applied based on file paths (globs) or context
- Rules can be manually referenced using @rule-name in conversations
- Each rule file is located in `.claude/rules/` directory

Usage notes:

- Rules are context-aware and apply when working on matching files
- Rules can reference other files using @filename syntax
- Rules should be focused and actionable
- Global rules have lower priority than domain-specific rules (frontend)
</usage>

<available_rules>

<rule>
<name>frontend-rules</name>
<description>前端规则系统：包含代码风格规范、组件使用规范、API 层规范、状态管理规范、样式规范等。技术栈：Vue 3 (Composition API) + Vite + Vant 4 + Tailwind CSS v4 + Axios + Vue Router。涵盖 Vue 3 script setup 语法、ref/reactive 选择、计时器清理、组件 props/emits/expose 定义、API 模块组织、极验集成、localStorage 使用等所有前端开发规范。</description>
<path>.claude/rules/frontend/AGENTS.md</path>
<globs>src/**/*.{vue,js}</globs>
</rule>

<rule>
<name>api-integration</name>
<description>API 对接规范：接口命名、请求/响应格式、错误处理、文档约定。所有 API 定义在 src/api/ 目录下，按业务域拆分为 auth.js、nft.js等模块。响应格式使用 code === 0 判断成功。请求拦截器自动注入 Bearer Token。401 响应自动清除 token 并跳转登录页。</description>
<path>.claude/rules/frontend/AGENTS.md</path>
<globs>src/api/**/*.{vue,js}</globs>
</rule>

<rule>
<name>code-style</name>
<description>代码风格规范：2 空格缩进、camelCase 变量命名、PascalCase 组件命名、UPPER_SNAKE_CASE 常量。导入顺序：Vue 核心 → 第三方库 → 路由 → 工具 → API → 组件。JSDoc 注释规范。localStorage 使用规范（JSON.stringify/parse）。</description>
<path>.claude/rules/frontend/code-style.md</path>
<globs>src/**/*.{vue,js}</globs>
</rule>

<rule>
<name>components</name>
<description>组件规范：所有组件使用 &lt;script setup&gt; 语法。Props 通过 defineProps 定义（含类型和默认值）。交互反馈通过 Vant showToast 提供。加载/空状态组件 LoadingState/EmptyState。计时器在 onUnmounted 中清理。</description>
<path>.claude/rules/frontend/components/AGENTS.md</path>
<globs>src/components/**/*.{vue,js}</globs>
</rule>

</available_rules>

<!-- RULES_TABLE_END -->

</rules_system>
