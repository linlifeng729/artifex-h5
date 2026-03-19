---
name: skill-creator
description: 创建高效 SKILL 的指南。当用户想要创建新的 SKILL（或更新现有 SKILL）来扩展 Claude 的能力时，使用此 SKILL 提供专门的知识、工作流程或工具集成。
license: Complete terms in LICENSE.txt
---

# Skill Creator

本 SKILL 提供创建高效 SKILL 的指南。

## 关于 SKILL

SKILL 是模块化、自包含的包，通过提供专门的知识、工作流程和工具来扩展 Claude 的能力。可以将它们视为特定领域或任务的"入职指南"——它们将 Claude 从通用代理转变为配备程序化知识的专用代理，这是任何模型都无法完全拥有的。

### SKILL 提供的内容

1. **专门的工作流程** - 针对特定领域的多步骤程序
2. **工具集成** - 使用特定文件格式或 API 的说明
3. **领域专业知识** - 公司特定的知识、数据模式、业务逻辑
4. **打包资源** - 脚本、参考资料和资产，用于复杂和重复的任务

## 核心原则

### 简洁是关键

上下文窗口是公共资源。SKILL 与 Claude 需要的所有其他内容共享上下文窗口：系统提示、对话历史、其他 SKILL 的元数据，以及实际的用户请求。

**默认假设：Claude 已经非常聪明。** 只添加 Claude 没有的上下文。挑战每一条信息："Claude 真的需要这个解释吗？"和"这个段落值得花费 token 吗？"

优先选择简洁的示例而不是冗长的解释。

### 设置适当的自由度

将具体程度与任务的脆弱性和可变性相匹配：

**高自由度（基于文本的指令）**：当多种方法有效、决策取决于上下文或启发式方法指导方法时使用。

**中等自由度（带参数的伪代码或脚本）**：当存在首选模式、某些变化可接受或配置影响行为时使用。

**低自由度（特定脚本、很少参数）**：当操作脆弱且容易出错、一致性至关重要或必须遵循特定顺序时使用。

把 Claude 想象成在探索一条路径：狭窄的山路需要特定的护栏（低自由度），而开阔的田野允许许多路线（高自由度）。

### SKILL 的结构

每个 SKILL 由必需的 SKILL.md 文件和可选的打包资源组成：

```
skill-name/
├── SKILL.md (必需)
│   ├── YAML frontmatter 元数据（必需）
│   │   ├── name:（必需）
│   │   └── description:（必需）
│   └── Markdown 说明（必需）
└── 打包资源（可选）
    ├── scripts/      - 可执行代码（Python/Bash 等）
    ├── references/  - 文档，按需加载到上下文中
    └── assets/      - 在输出中使用的文件（模板、图标、字体等）
```

#### SKILL.md（必需）

每个 SKILL.md 包括：

- **Frontmatter**（YAML）：包含 `name` 和 `description` 字段。这些是 Claude 用来决定何时使用 SKILL 的唯一字段，因此清晰、全面地描述 SKILL 是什么以及何时使用它非常重要。
- **Body**（Markdown）：使用 SKILL 的说明和指南。仅在 SKILL 触发后加载（如果触发的话）。

#### 打包资源（可选）

##### 脚本（`scripts/`）

需要确定性可靠性或需要反复重写的任务的可执行代码（Python/Bash 等）。

- **何时包含**：当相同的代码被反复重写或需要确定性可靠性时
- **示例**：`scripts/rotate_pdf.py` 用于 PDF 旋转任务
- **优点**：Token 高效、确定性、可执行而无需加载到上下文中
- **注意**：脚本可能仍需要 Claude 读取以进行修补或特定环境的调整

##### 参考资料（`references/`）

文档和参考资料，按需加载到上下文中以指导 Claude 的流程和思考。

- **何时包含**：用于 Claude 在工作时应该参考的文档
- **示例**：`references/finance.md` 用于财务模式、`references/mnda.md` 用于公司 NDA 模板、`references/policies.md` 用于公司政策、`references/api_docs.md` 用于 API 规范
- **用例**：数据库模式、API 文档、领域知识、公司政策、详细的工作流程指南
- **优点**：保持 SKILL.md 精简，仅在 Claude 确定需要时加载
- **最佳实践**：如果文件很大（>10k 字），在 SKILL.md 中包含 grep 搜索模式
- **避免重复**：信息应该存在于 SKILL.md 或参考资料文件中，而不是两者兼有。详细信息首选参考资料文件，除非它确实是 SKILL 的核心——这保持 SKILL.md 精简，同时使信息可被发现而不占用上下文窗口。只保留基本的程序化说明和工作流程指南在 SKILL.md 中；将详细的参考资料、模式和示例移到参考资料文件中。

##### 资产（`assets/`）

不打算加载到上下文中的文件，而是在 Claude 生成的输出中使用。

- **何时包含**：当 SKILL 需要在最终输出中使用的文件时
- **示例**：`assets/logo.png` 用于品牌资产、`assets/slides.pptx` 用于 PowerPoint 模板、`assets/frontend-template/` 用于 HTML/React 样板、`assets/font.ttf` 用于字体
- **用例**：模板、图像、图标、样板代码、字体、复制的示例文档
- **优点**：将输出资源与文档分离，使 Claude 能够在不加载到上下文中的情况下使用文件

#### 什么不应该包含在 SKILL 中

SKILL 应该只包含直接支持其功能的基本文件。不要创建额外的文档或辅助文件，包括：

- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- 等等。

SKILL 应该只包含 AI 代理完成当前工作所需的信息。它不应该包含关于创建过程、设置和测试程序、面向用户的文档等的辅助上下文。创建额外的文档文件只会增加混乱和干扰。

### 渐进式披露设计原则

SKILL 使用三级加载系统来有效管理上下文：

1. **元数据（name + description）** - 始终在上下文中（~100 字）
2. **SKILL.md 正文** - 当 SKILL 触发时（<5k 字）
3. **打包资源** - 根据 Claude 需要（无限，因为脚本可以在不读取到上下文窗口的情况下执行）

#### 渐进式披露模式

将 SKILL.md 正文保持在必要内容以内，低于 500 行，以最小化上下文膨胀。当接近此限制时，将内容拆分为单独的文件。当将内容拆分到其他文件中时，非常重要的是要从 SKILL.md 引用它们并清楚描述何时阅读它们，以确保 SKILL 的读者知道它们的存在以及何时使用它们。

**关键原则：** 当 SKILL 支持多种变化、框架或选项时，只将核心工作流程和选择指南保留在 SKILL.md 中。将特定变化的详细信息（模式、示例、配置）移到单独的参考资料文件中。

**模式 1：高级指南带参考资料**

```markdown
# PDF 处理

## 快速开始

使用 pdfplumber 提取文本：
[代码示例]

## 高级功能

- **表单填写**：参见 [FORMS.md](FORMS.md) 完整指南
- **API 参考**：参见 [REFERENCE.md](REFERENCE.md) 所有方法
- **示例**：参见 [EXAMPLES.md](EXAMPLES.md) 常见模式
```

Claude 只在需要时加载 FORMS.md、REFERENCE.md 或 EXAMPLES.md。

**模式 2：按领域组织**

对于多领域 SKILL，按领域组织内容以避免加载无关上下文：

```
bigquery-skill/
├── SKILL.md（概述和导航）
└── reference/
    ├── finance.md（收入、计费指标）
    ├── sales.md（机会、管道）
    ├── product.md（API 用法、功能）
    └── marketing.md（活动、归因）
```

当用户询问销售指标时，Claude 只读取 sales.md。

同样，对于支持多种框架或变化的 SKILL，按变化组织：

```
cloud-deploy/
├── SKILL.md（工作流程 + 提供商选择）
└── references/
    ├── aws.md（AWS 部署模式）
    ├── gcp.md（GCP 部署模式）
    └── azure.md（Azure 部署模式）
```

当用户选择 AWS 时，Claude 只读取 aws.md。

**模式 3：条件细节**

显示基本内容，链接到高级内容：

```markdown
# DOCX 处理

## 创建文档

使用 docx-js 创建新文档。参见 [DOCX-JS.md](DOCX-JS.md)。

## 编辑文档

对于简单编辑，直接修改 XML。

**对于修订跟踪**：参见 [REDLINING.md](REDLINING.md)
**对于 OOXML 细节**：参见 [OOXML.md](OOXML.md)
```

Claude 只在用户需要这些功能时读取 REDLINING.md 或 OOXML.md。

**重要指南：**

- **避免深度嵌套的参考资料** - 保持参考资料从 SKILL.md 向下只有一级。所有参考资料文件应该直接从 SKILL.md 链接。
- **结构化更长的参考资料文件** - 对于超过 100 行的文件，在顶部包含目录，以便 Claude 在预览时可以看到完整范围。

## SKILL 创建流程

SKILL 创建涉及以下步骤：

1. 通过具体示例理解 SKILL
2. 规划可复用的 SKILL 内容（脚本、参考资料、资产）
3. 初始化 SKILL（运行 init_skill.py）
4. 编辑 SKILL（实现资源并编写 SKILL.md）
5. 打包 SKILL（运行 package_skill.py）
6. 根据实际使用情况进行迭代

按顺序遵循这些步骤，只有在有明确理由不适用时才跳过。

### 步骤 1：通过具体示例理解 SKILL

只有当 SKILL 的使用模式已经很清楚时才跳过此步骤。即使在处理现有 SKILL 时，它仍然很有价值。

要创建有效的 SKILL，需要清楚地了解 SKILL 将如何使用的具体示例。这种理解可以直接来自用户示例或通过用户反馈验证的生成示例。

例如，在构建图像编辑器 SKILL 时，相关问题包括：

- "image-editor SKILL 应该支持什么功能？编辑、旋转，还有其他的吗？"
- "你能举一些这个 SKILL 将如何使用的例子吗？"
- "我可以想象用户会问'帮我移除这张照片的红眼'或'旋转这张照片'。你认为这个 SKILL 还可以用其他方式使用吗？"
- "用户说什么应该触发这个 SKILL？"

为了避免让用户不知所措，避免在一条消息中问太多问题。从最重要的问题开始，根据需要跟进以提高效率。

当对 SKILL 应该支持的功能有清晰的认知时，完成此步骤。

### 步骤 2：规划可复用的 SKILL 内容

要将具体示例转化为有效的 SKILL，通过以下方式分析每个示例：

1. 考虑如何从头开始执行示例
2. 识别当反复执行这些工作流程时，哪些脚本、参考资料和资产会有帮助

示例：在构建 `pdf-editor` SKILL 来处理"帮我旋转这个 PDF"这样的查询时，分析显示：

1. 旋转 PDF 每次都需要重写相同的代码
2. 一个 `scripts/rotate_pdf.py` 脚本将有助于存储在 SKILL 中

示例：在设计 `frontend-webapp-builder` SKILL 来处理"帮我构建一个待办事项应用"或"帮我构建一个步数追踪仪表盘"这样的查询时，分析显示：

1. 编写前端 Web 应用每次都需要相同的 HTML/React 样板
2. 一个包含 HTML/React 项目文件样板的 `assets/hello-world/` 模板将有助于存储在 SKILL 中

示例：在构建 `big-query` SKILL 来处理"今天有多少用户登录？"这样的查询时，分析显示：

1. 查询 BigQuery 每次都需要重新发现表模式和关系
2. 一个记录表模式的 `references/schema.md` 文件将有助于存储在 SKILL 中

要确定 SKILL 的内容，分析每个具体示例以创建要包含的可重用资源列表：脚本、参考资料和资产。

### 步骤 3：初始化 SKILL

现在是时候实际创建 SKILL 了。

只有当要开发的 SKILL 已存在并需要迭代或打包时才跳过此步骤。在这种情况下，继续下一步。

从头创建新 SKILL 时，始终运行 `init_skill.py` 脚本。该脚本方便地生成一个新的模板 SKILL 目录，自动包含 SKILL 所需的所有内容，使 SKILL 创建过程更加高效和可靠。

用法：

```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

该脚本：

- 在指定路径创建 SKILL 目录
- 生成带有正确 frontmatter 和 TODO 占位符的 SKILL.md 模板
- 创建示例资源目录：`scripts/`、`references/` 和 `assets/`
- 在每个目录中添加可自定义或删除的示例文件

初始化后，根据需要自定义或删除生成的 SKILL.md 和示例文件。

### 步骤 4：编辑 SKILL

在编辑（新生成或现有）SKILL 时，请记住，SKILL 是为另一个 Claude 实例使用的。包含对 Claude 有益且不明显的信息。考虑什么样的程序化知识、特定领域的细节或可重用资产能够帮助另一个 Claude 实例更有效地执行这些任务。

#### 学习经过验证的设计模式

根据 SKILL 的需要查阅这些有用的指南：

- **多步骤流程**：参见 references/workflows.md 了解顺序工作流程和条件逻辑
- **特定输出格式或质量标准**：参见 references/output-patterns.md 了解模板和示例模式

这些文件包含有效的 SKILL 设计的既定最佳实践。

#### 从可复用的 SKILL 内容开始

要开始实现，从上面识别的可重用资源开始：`scripts/`、`references/` 和 `assets/` 文件。请注意，此步骤可能需要用户输入。例如，在实现 `brand-guidelines` SKILL 时，用户可能需要提供品牌资产或模板存储在 `assets/`，或存储在 `references/` 中的文档。

添加的脚本必须通过实际运行来测试，以确保没有错误且输出符合预期。如果有很多相似的脚本，只需要测试代表性样本以确保置信度，同时平衡完成时间。

不需要的 SKILL 的任何示例文件和目录都应删除。初始化脚本在 `scripts/`、`references/` 和 `assets/` 中创建示例文件以展示结构，但大多数 SKILL 不需要所有这些。

#### 更新 SKILL.md

**写作指南：** 始终使用祈使句/不定式形式。

##### Frontmatter

编写带有 `name` 和 `description` 的 YAML frontmatter：

- `name`：SKILL 名称
- `description`：这是 SKILL 的主要触发机制，帮助 Claude 理解何时使用 SKILL
  - 包括 SKILL 做什么以及具体的触发器/上下文
  - 将所有"何时使用"信息放在这里——而不是在正文中。正文只在触发后加载，所以正文中的"何时使用此 SKILL"部分对 Claude 没有帮助
  - 例如 `docx` SKILL 的描述："全面的文档创建、编辑和分析，支持修订跟踪、评论、格式保留和文本提取。当 Claude 需要处理专业文档（.docx 文件）时使用：(1) 创建新文档，(2) 修改或编辑内容，(3) 处理修订跟踪，(4) 添加评论，或任何其他文档任务"

不要在 YAML frontmatter 中包含任何其他字段。

##### Body

编写使用 SKILL 及其打包资源的说明。

### 步骤 5：打包 SKILL

SKILL 开发完成后，必须将其打包成可分发的 .skill 文件与用户共享。打包过程首先自动验证 SKILL 以确保满足所有要求：

```bash
scripts/package_skill.py <path/to/skill-folder>
```

可选的输出目录指定：

```bash
scripts/package_skill.py <path/to/skill-folder> ./dist
```

打包脚本将：

1. **自动验证** SKILL，检查：
   - YAML frontmatter 格式和必需字段
   - SKILL 命名约定和目录结构
   - 描述的完整性和质量
   - 文件组织和资源引用

2. **如果验证通过则打包** SKILL，创建一个以 SKILL 命名的 .skill 文件（例如 `my-skill.skill`），其中包含所有文件并保持正确的目录结构以供分发。.skill 文件是带有 .skill 扩展名的 zip 文件。

如果验证失败，脚本将报告错误并退出而不创建包。修复任何验证错误，然后再次运行打包命令。

### 步骤 6：迭代

测试 SKILL 后，用户可能会请求改进。这通常发生在使用 SKILL 后，立即获得关于 SKILL 表现如何的新鲜上下文时。

**迭代工作流程：**

1. 在实际任务上使用 SKILL
2. 注意困难或低效的地方
3. 识别 SKILL.md 或打包资源应该如何更新
4. 实施更改并再次测试
