---
title: Python 进行栅格数据重投影：从坐标系判断到结果验证
description: 使用 Rasterio 完成栅格重投影，并系统检查目标分辨率、重采样方法、NoData 与空间范围。
pubDate: 2026-07-12
updatedDate: 2026-07-18
draft: false
category: geography
subcategory: GIS 与空间分析
tags: [GIS, Python, Rasterio, 栅格数据]
series: 空间数据处理基础
featured: true
references:
  - title: Rasterio Reprojection 官方文档
    url: https://rasterio.readthedocs.io/en/stable/topics/reproject.html
  - title: PROJ 坐标转换文档
    url: https://proj.org/en/stable/
---

栅格重投影看起来只是“把 CRS 换一下”，实际同时改变了像元位置、空间范围，通常还会改变分辨率和行列数。一次可靠的重投影，需要在运行代码前回答三个问题：源数据的坐标参考系是否可信？目标坐标系是否适合研究区？连续变量与分类变量应该怎样重采样？

## 先检查源数据

使用 Rasterio 打开数据后，先查看 `crs`、`transform`、`bounds`、`resolution` 与 `nodata`。如果源数据没有 CRS，不应直接猜测并重投影；需要回到数据说明或生产流程确认。

```python
import rasterio

with rasterio.open("input.tif") as src:
    print("CRS:", src.crs)
    print("范围:", src.bounds)
    print("分辨率:", src.res)
    print("NoData:", src.nodata)
    print("尺寸:", src.width, src.height)
```

还要注意经纬度顺序。EPSG 代码能减少手写参数造成的歧义，但不能替代对数据语义的判断。

## 计算目标网格

`calculate_default_transform` 会根据源数据范围与目标 CRS 推导新的仿射变换和栅格尺寸。对于局部研究，目标 CRS 通常应尽量减少研究区内的面积或距离变形。

```python
from rasterio.warp import calculate_default_transform

dst_crs = "EPSG:32650"

with rasterio.open("input.tif") as src:
    transform, width, height = calculate_default_transform(
        src.crs,
        dst_crs,
        src.width,
        src.height,
        *src.bounds,
    )
```

如果分析要求固定分辨率，可以向函数传入 `resolution=30`。这时需要确认单位：投影坐标系常用米，经纬度坐标系使用度，二者不可直接等价。

## 执行逐波段重投影

下面的完整流程复制元数据，更新目标网格，并逐波段写入结果。连续型数据可以使用双线性插值；土地覆盖等类别数据应使用最近邻，避免产生不存在的类别编号。

```python
import rasterio
from rasterio.warp import Resampling, calculate_default_transform, reproject

src_path = "input.tif"
dst_path = "output_utm.tif"
dst_crs = "EPSG:32650"

with rasterio.open(src_path) as src:
    transform, width, height = calculate_default_transform(
        src.crs, dst_crs, src.width, src.height, *src.bounds
    )
    profile = src.profile.copy()
    profile.update(
        crs=dst_crs,
        transform=transform,
        width=width,
        height=height,
        compress="deflate",
    )

    with rasterio.open(dst_path, "w", **profile) as dst:
        for band in range(1, src.count + 1):
            reproject(
                source=rasterio.band(src, band),
                destination=rasterio.band(dst, band),
                src_transform=src.transform,
                src_crs=src.crs,
                src_nodata=src.nodata,
                dst_transform=transform,
                dst_crs=dst_crs,
                dst_nodata=src.nodata,
                resampling=Resampling.bilinear,
            )
```

## 如何选择重采样方法

| 数据类型             | 推荐方法   | 说明                     |
| -------------------- | ---------- | ------------------------ |
| 土地覆盖、行政区编码 | 最近邻     | 保留原始类别值           |
| 温度、高程、指数     | 双线性     | 连续表面更平滑           |
| 高质量连续影像       | 三次卷积   | 计算量更高，可能产生过冲 |
| 降水量等总量变量     | 需谨慎验证 | 仅靠普通插值未必保持总量 |

“视觉上更平滑”并不代表分析上更正确。重采样方法应该由变量的测量尺度与后续分析决定。

## 结果验证清单

1. 确认输出 CRS 与预期一致。
2. 将输出范围反算回源 CRS，检查是否覆盖相同地理区域。
3. 叠加边界或控制点，观察是否存在整体偏移。
4. 对分类数据检查唯一值集合；对连续数据检查极值和均值变化。
5. 检查 NoData 边界、压缩方式和多波段顺序。

重投影不是纯粹的文件格式转换，而是重新定义观测值落在何种空间网格上。把检查过程写入脚本，比只在 GIS 软件里肉眼查看更容易复现。
