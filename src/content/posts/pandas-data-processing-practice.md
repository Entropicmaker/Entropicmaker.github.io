---
title: 数据处理中的 Pandas 实践：让清洗流程可检查、可复用
description: 以字段类型、缺失值、连接关系和链式处理为线索，整理一套适合研究数据的 Pandas 工作习惯。
pubDate: 2026-04-08
draft: false
category: computer-science
subcategory: 数据分析与可视化
tags: [Python, Pandas, 数据清洗, 可复现研究]
series: Python 数据工作流
featured: false
references:
  - title: pandas User Guide
    url: https://pandas.pydata.org/docs/user_guide/index.html
---

Pandas 让表格处理很方便，也容易让脚本变成一长串难以检查的临时操作。研究数据清洗不仅要得到结果，还应保留输入假设、异常记录与每一步的数据规模变化。

## 读取时就明确类型

自动类型推断适合探索，不适合长期流程。行政区代码、站点编号和邮政编码虽然只含数字，却通常应该作为字符串读取，否则前导零会消失。

```python
import pandas as pd

df = pd.read_csv(
    "observations.csv",
    dtype={"station_id": "string", "region_code": "string"},
    parse_dates=["observed_at"],
    na_values=["-9999", "NA", ""],
)
```

读入后立即检查行数、列名、数据类型与关键字段的唯一值数量。

```python
print(df.shape)
print(df.dtypes)
print(df["station_id"].nunique(dropna=False))
```

## 缺失值需要语义

缺失可能表示未观测、仪器故障、不适用或低于检测限。这些情况不应在未经判断时统一填零。

可以先生成缺失概况：

```python
missing = (
    df.isna()
      .mean()
      .sort_values(ascending=False)
      .rename("missing_rate")
)
```

对于关键字段，建议把删除的记录单独保存，形成可审计的异常表。

## 用函数封装稳定步骤

当某一清洗规则已经明确，使用小函数比在 Notebook 中反复复制代码更可靠。

```python
def normalize_columns(frame: pd.DataFrame) -> pd.DataFrame:
    return frame.rename(columns=lambda name: name.strip().lower()).assign(
        station_id=lambda x: x["station_id"].str.strip(),
        value=lambda x: pd.to_numeric(x["value"], errors="coerce"),
    )

clean = normalize_columns(df)
```

函数应尽量返回新表，而不是在多个位置隐式修改同一对象。这样更容易写测试，也能减少 `SettingWithCopyWarning` 背后的歧义。

## 连接表格前先验证关系

`merge` 最危险的问题不是报错，而是悄悄把行数放大。连接前应确认键是否唯一，并使用 `validate` 声明预期关系。

```python
result = observations.merge(
    stations,
    on="station_id",
    how="left",
    validate="many_to_one",
    indicator=True,
)

print(result["_merge"].value_counts())
```

如果站点表中的 `station_id` 重复，`many_to_one` 会立即报错，而不是生成看似正常的重复观测。

## 分组统计要保留样本量

只输出均值会隐藏样本不足。推荐同时保留计数、均值、中位数与离散程度。

```python
summary = (
    clean.groupby(["region_code", "year"], dropna=False)
         .agg(
             count=("value", "count"),
             mean=("value", "mean"),
             median=("value", "median"),
             std=("value", "std"),
         )
         .reset_index()
)
```

## 输出之前做断言

```python
assert clean["station_id"].notna().all()
assert clean["value"].between(-50, 60).all()
assert len(clean) <= len(df)
```

断言不是完整的数据验证系统，但可以把关键假设变成会失败的检查。对于长期项目，还可以记录软件版本、输入文件哈希与处理时间。

## 一份实用检查表

- 原始文件保持只读，不在原地覆盖；
- 字段名称与单位统一记录；
- 每次筛选前后记录行数；
- 连接时验证基数与未匹配记录；
- 不把缺失值处理藏在绘图代码里；
- 中间结果只在能帮助诊断时保存；
- 最终表附带数据字典与生成脚本。

好的 Pandas 流程不是方法链越短越好，而是每个转换都有名字、有理由，并且出现异常时能快速定位。
