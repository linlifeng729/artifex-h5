---
name: frontend-design
description: 创建独特、production-grade 的前端界面，具有高设计质量。当用户需要构建网页组件、页面、应用、海报或任何 web UI 的样式/美化工作时使用此 skill。本项目（Artifex-H5）使用 Vue 3 + Vant 4 + Tailwind CSS v4。
---

# Frontend Design

创建独特、有设计感的前端界面，避免廉价的"AI 生成"风格。

## 设计思维

在编码之前，理解上下文并确定一个明确的设计方向：

- **目的**：这个界面解决什么问题？谁是用户？
- **风格**：选择一个极端的方向：极简主义、极繁主义、复古未来主义、有机自然、奢华精致、活泼童趣、杂志编辑风、 brutalist、工业实用等
- **约束**：技术要求（框架、性能、可访问性）
- **差异化**：什么是让人印象深刻的？用户会记住什么？

**关键**：选择清晰的设计方向并精准执行。无论是大胆的极繁还是精致的极简，关键在于意图明确，而不是追求强度。

然后实现可工作的代码（Vue 3 组件），需要：
- Production 级且功能完整
- 视觉上有冲击力且令人难忘
- 整体协调，有清晰的设计观点
- 每个细节都经过精心打磨

## 本项目设计方向

### 现有风格：Dark Glassmorphism
- 深色渐变背景：`linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)`
- 玻璃态卡片：`rgba(255,255,255,0.1)` + `backdrop-filter: blur(10px)`
- 主色：`#3cb371`（极客绿）
- 激活态高亮：`#FFD700`
- 渐变标题：`linear-gradient(to right, #60a5fa, #a855f7, #f472b6)`

### 如果需要新建页面或重构
在沿用现有深色玻璃态风格的基础上，可以选择以下设计方向：
1. **沿用现有**：深色玻璃态 + 极客绿主色
2. **科技未来**：暗色 + 霓虹蓝/霓虹紫 + 网格背景
3. **极简奢华**：深色 + 金色点缀 + 大量留白
4. **活力多彩**：暗底 + 渐变色块 + 几何装饰

## 技术实现规范

### Vue 3 + Tailwind CSS v4
- 所有新组件使用 `<script setup>` 语法
- Tailwind 类用于布局、间距、颜色
- `<style scoped>` 用于复杂动画和第三方组件覆盖
- 图片使用 `background-image` + `background-size: cover`

### CSS 动画原则
- 优先使用纯 CSS 动画
- 聚焦高 impact 时刻：精心设计的加载动画比分散的微交互更能带来愉悦感
- 动画时长参考：`transition: 0.2s ~ 0.3s`，加载旋转：`0.8s ~ 1s linear infinite`

### 玻璃态实现模板
```vue
<div
  class="rounded-2xl border backdrop-blur-sm"
  style="background: rgba(255, 255, 255, 0.1);
         border: 1px solid rgba(255, 255, 255, 0.3);
         backdrop-filter: blur(10px);">
  <!-- 内容 -->
</div>
```

### 聚焦态输入框
```vue
<div style="background: rgba(255, 255, 255, 0.05);
           border: 1px solid rgba(255, 255, 255, 0.3);
           border-radius: 8px;"
     class="focus-within:border-[#3cb371] focus-within:bg-white/10
            focus-within:shadow-green-500/20">
  <input />
</div>
```

## 禁止的 AI 生成美学

不要使用常见的 AI 生成美学，包括：
- 过度使用的字体家族（Inter、Roboto、Arial、系统字体）
- 陈腐的配色方案（尤其是白色背景上的紫色渐变）
- 可预测的布局和组件模式
- 缺乏上下文特性的模板设计

创意诠释，做出与上下文真正匹配的选择。每个设计都应该不同。在浅色和深色主题、不同字体、不同美学之间变化。永远不要在不同设计中收敛到常见选择。

## 重要提示

将实现复杂度与美学愿景匹配。极繁设计需要包含大量动画和效果的复杂代码。极简或精致的设计需要克制、精准和仔细注意间距、字体和细微细节。优雅来自于很好地执行愿景。

记住：Claude 有能力做出非凡的创意工作。不要退缩，展示真正跳出框框并完全致力于独特愿景所能创造的内容。

## 参考文件
- UI 规范：`@.claude/docs/前端交互设计文档.md`
- 组件规范：`@.claude/rules/frontend/components/AGENTS.md`
