---
title: 空间权重矩阵与空间自相关：从邻接关系到 Moran's I
description: 解释空间权重矩阵的构建选择、全局 Moran's I 的直觉与置换检验，并提示尺度和边界效应。
pubDate: 2026-02-10
updatedDate: 2026-02-15
draft: false
category: geocomputing
subcategory: 地理计算
tags: [空间统计, 空间自相关, Moran's I, PySAL]
series: 空间统计入门
featured: true
references:
  - title: PySAL esda 文档
    url: https://pysal.org/esda/
  - title: PySAL libpysal 权重文档
    url: https://pysal.org/libpysal/
---

传统统计常假设观测相互独立，但地理现象往往表现出“相近位置更相似”。空间自相关用来描述变量值与空间位置之间的系统性关系，而空间权重矩阵决定了什么叫“相近”。

## 空间权重矩阵是什么

设有 $n$ 个空间单元，权重矩阵 $W=[w_{ij}]$ 是一个 $n \times n$ 矩阵。元素 $w_{ij}$ 描述单元 $i$ 与 $j$ 的空间关系，通常令 $w_{ii}=0$。

常见构建方法包括：

- 邻接权重：共享边界即为邻居；
- 距离阈值：距离小于某个阈值即连接；
- K 近邻：每个单元连接最近的 $k$ 个单元；
- 反距离权重：距离越远，权重越小。

矩阵常进行行标准化，使每行权重之和为 1。这样空间滞后 $Wy$ 可以理解为邻居值的加权平均，但也会让原本对称的关系变为非对称数值。

## Queen 与 Rook 邻接

面数据邻接常借用棋盘命名：Rook 邻接要求共享一段边，Queen 邻接还把只共享顶点的多边形视为邻居。

```python
import geopandas as gpd
from libpysal.weights import Queen, Rook

gdf = gpd.read_file("regions.gpkg")
queen = Queen.from_dataframe(gdf, use_index=True)
rook = Rook.from_dataframe(gdf, use_index=True)

queen.transform = "R"
```

选择哪一种不是纯技术偏好。疾病传播、道路联系和行政政策扩散对“接触”的定义可能完全不同。

## 全局 Moran's I

全局 Moran's I 的常见形式为：

$$
I = \frac{n}{S_0}
\frac{\sum_i\sum_j w_{ij}(x_i-\bar{x})(x_j-\bar{x})}
{\sum_i(x_i-\bar{x})^2}
$$

其中 $S_0=\sum_i\sum_jw_{ij}$。直观上，分子比较相邻单元偏离均值的方向是否一致：高值邻近高值、低值邻近低值会贡献正值；高低相邻则贡献负值。

Moran's I 不是简单限制在 $[-1,1]$，其期望值也不是 0。在随机化假设下，期望值为：

$$
E[I] = -\frac{1}{n-1}
$$

## 用置换检验评估显著性

置换检验固定空间关系，随机打乱属性值，多次计算统计量，得到随机空间分布下的参照分布。

```python
from esda.moran import Moran

y = gdf["value"].to_numpy()
mi = Moran(y, queen, permutations=999)

print("Moran's I:", mi.I)
print("置换 p 值:", mi.p_sim)
```

较小的置换 p 值说明当前空间排列在随机重排中较少出现，但不能单独证明某种因果机制。

## 从全局到局部

全局统计量把整个研究区概括为一个值，可能掩盖局部差异。局部 Moran's I 可以识别高—高、低—低聚集和高—低、低—高空间离群，但同时涉及多重比较问题。

局部聚集图应与显著性图、原始变量地图和样本量信息一起阅读，不能只展示颜色鲜明的象限分类。

## 权重选择的敏感性

一套稳健分析至少应比较若干合理权重：

1. Queen 与 Rook 邻接结果是否一致；
2. K 近邻中不同 $k$ 的影响；
3. 是否存在孤立单元；
4. 距离阈值是否具有过程意义；
5. 行标准化是否符合模型解释。

还要关注研究区边界。边缘单元在数据之外可能仍有邻居，只是被研究边界截断。不同空间尺度和分区方式也会改变权重与统计结果。

## 一个解释模板

报告结果时，可以依次说明：变量与空间单元、权重构建规则、是否标准化、统计量、置换次数与 p 值、敏感性检查，以及不能据此推出的结论。

空间自相关并不是地图上“看起来成团”的量化装饰。它是一种明确依赖空间关系定义的统计判断；权重矩阵必须和研究过程相匹配，结果才有可解释性。
