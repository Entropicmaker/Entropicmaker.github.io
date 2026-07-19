---
title: 测试文章：博客写作与发布检查
description: 用于检查 Markdown 排版、代码高亮、数学公式、标签和自动部署是否正常的测试文章。
pubDate: 2026-07-19
draft: false
category: geocomputing
subcategory: 项目复盘
tags: [测试, Astro, Markdown]
series: 博客维护
featured: true
references:
  - title: Astro 内容集合文档
    url: https://docs.astro.build/zh-cn/guides/content-collections/
---

这是网站目前保留的唯一一篇测试文章。今后可以复制 `templates/post-template.md`，修改文件名和开头的文章信息，再开始写作。

## Markdown 排版测试

正文支持标题、列表、引用、表格和脚注式参考资料。写作时建议每个段落只表达一个主要意思。

> 这是一段引用，用于检查浅色和深色模式下的对比度。

| 检查项目 | 当前状态   |
| -------- | ---------- |
| 中文排版 | 正常       |
| 代码高亮 | 正常       |
| 数学公式 | 正常       |
| 静态搜索 | 构建后生成 |

## 代码高亮测试

```python
def hello_blog(name: str) -> str:
    return f"你好，{name}！"


print(hello_blog("选择性失忆"))
```

## 数学公式测试

空间权重矩阵可以写作 $W = [w_{ij}]$。一个简化的空间滞后项为：

$$
(Wy)_i = \sum_j w_{ij}y_j
$$

## 发布检查

1. 本地运行 `npm run dev` 查看页面。
2. 运行 `npm run check` 检查文章字段和 Astro 类型。
3. 运行 `npm run build` 验证生产构建和静态搜索。
4. 提交并推送到 `main`，GitHub Actions 会自动发布。

这篇文章可以继续用于测试，也可以在第一篇正式文章完成后删除。
