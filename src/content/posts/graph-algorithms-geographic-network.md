---
title: 常见图算法与地理网络分析：从最短路径到连通性
description: 用地理网络的视角理解 BFS、Dijkstra、A*、最小生成树与中心性，并讨论权重设计的重要性。
pubDate: 2026-05-20
updatedDate: 2026-05-26
draft: false
category: computer-science
subcategory: 算法与数据结构
tags: [图算法, 地理网络, Python, NetworkX]
series: 算法与空间问题
featured: false
references:
  - title: NetworkX Algorithms 文档
    url: https://networkx.org/documentation/stable/reference/algorithms/index.html
---

道路、河流、航线、管网和行政联系都可以抽象为图。图算法给出了通用计算框架，但地理网络分析的关键往往不是“调用哪个函数”，而是节点、边与权重是否真实表达研究问题。

## 图模型的三个基本对象

图 $G=(V,E)$ 由节点集合 $V$ 和边集合 $E$ 组成。在道路网络中，交叉口可作为节点，道路段可作为边；边上可以附加长度、时间、费用、坡度或通行限制。

需要先决定网络是否有向。单行道、河流流向和航班方向都意味着从 $u$ 到 $v$ 与从 $v$ 到 $u$ 可能不是同一条边。

## BFS 与无权最短路径

广度优先搜索（BFS）逐层访问节点，在每条边代价相同的图上可以得到最少边数路径。它适合回答“最少经过几个换乘站”一类问题，但不适合直接计算道路距离。

```python
from collections import deque

def bfs(graph, start):
    queue = deque([start])
    visited = {start}
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order
```

## Dijkstra：非负权重下的最短路径

Dijkstra 算法不断确定当前距离最小的未访问节点。只要边权非负，它就能得到正确的单源最短路径。

```python
import networkx as nx

graph = nx.DiGraph()
graph.add_edge("A", "B", travel_time=8)
graph.add_edge("B", "C", travel_time=5)
graph.add_edge("A", "C", travel_time=20)

path = nx.shortest_path(graph, "A", "C", weight="travel_time")
cost = nx.shortest_path_length(graph, "A", "C", weight="travel_time")
```

道路网络中的时间权重不应简单等于长度除以限速。路口延误、转向限制、拥堵和道路等级都可能影响实际通行时间。

## A*：用启发式函数加速

A* 在 Dijkstra 的累计代价之外，加入从当前节点到终点的估计代价。若启发式函数不高估真实代价，就能保持最优性。

在投影坐标系道路网络中，节点到终点的欧氏距离常用作长度最短路径的启发函数。若边权是时间，则需要用一个合理的最大速度把直线距离转换为时间下界。

## 最小生成树与网络骨架

最小生成树连接所有节点，同时使总边权最小且不形成环。它可以帮助思考基础设施骨架或采样连接方案，但结果通常忽略冗余需求。真实交通与通信网络需要备份路径，不能把最小生成树直接当作工程方案。

## 中心性不止一种

| 指标           | 直观含义             | 地理解释示例   |
| -------------- | -------------------- | -------------- |
| 度中心性       | 直接连接数量         | 连接较多的枢纽 |
| 接近中心性     | 到其他节点的平均距离 | 整体可达性较好 |
| 中介中心性     | 位于多少最短路径上   | 潜在流量瓶颈   |
| 特征向量中心性 | 与重要节点相连       | 网络影响力     |

中心性结果依赖网络边界。截取研究区会切断跨区联系，使边缘节点的指标产生偏差。

## 地理网络中的常见陷阱

1. 直接使用经纬度计算欧氏距离；
2. 忽略道路交叉但未拓扑相连的情况；
3. 没有清理重复节点和极短悬挂边；
4. 把所有道路视为双向可通行；
5. 用几何最短代替研究问题真正关心的成本最小。

图算法提供了计算答案的方式，地理建模决定了答案对应什么现实含义。把权重、方向和网络边界作为方法的一部分明确记录，分析才具有可解释性。
