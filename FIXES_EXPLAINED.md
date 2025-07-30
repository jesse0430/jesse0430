# Material React Table Autocomplete onChange 修复说明

## 问题描述

在 Material React Table 中使用自定义 Autocomplete 组件时，`onChange` 事件无效，无法正确更新编辑行的值。

### 原始问题代码

```javascript
muiEditTextFieldProps: ({ row, table }) => ({
  InputProps: {
    inputComponent: ({ inputRef, ...props }) => (
      <Autocomplete
        // ... 其他属性
        onChange={(event, newValue) => {
          // 这个onChange不会生效
          table.setEditingRow({
            ...row,
            values: {
              ...row.values,
              source: newValue,
            },
          });
        }}
      />
    ),
  },
})
```

## 问题原因

1. **不正确的API使用**：`muiEditTextFieldProps` 的 `InputProps.inputComponent` 方式会与Material React Table的内部状态管理产生冲突
2. **状态更新方式错误**：直接修改 `row.values` 不是正确的更新编辑状态的方式
3. **编辑流程干扰**：自定义inputComponent会干扰默认的编辑流程

## 解决方案

### 方案1: 使用 Cell 组件 (推荐)

```javascript
{
  accessorKey: 'source',
  header: 'Source IP',
  Cell: ({ cell, row, table }) => {
    const isEditing = table.getState().editingRow?.id === row.id;
    
    if (isEditing) {
      return (
        <Autocomplete
          // ... 配置
          onChange={(event, newValue) => {
            // 正确的更新方式
            const editingRow = table.getState().editingRow;
            if (editingRow) {
              table.setEditingRow({
                ...editingRow,
                _valuesCache: {
                  ...editingRow._valuesCache,
                  source: newValue,
                },
              });
            }
          }}
          value={row.original?.source || null}
        />
      );
    }
    
    // 非编辑状态的显示
    return displayValue;
  },
  // 隐藏默认编辑框
  muiEditTextFieldProps: () => ({
    style: { display: 'none' },
  }),
}
```

### 方案2: 使用 Edit 组件

```javascript
{
  accessorKey: 'source',
  Edit: ({ cell, column, row, table }) => (
    <Autocomplete
      // ... 配置
      onChange={(event, newValue) => {
        cell.setValue(newValue);
      }}
      value={cell.getValue() || null}
    />
  ),
}
```

## 关键修复点

### 1. 正确的状态更新
使用 `_valuesCache` 而不是直接修改 `values`：
```javascript
table.setEditingRow({
  ...editingRow,
  _valuesCache: {
    ...editingRow._valuesCache,
    fieldName: newValue,
  },
});
```

### 2. 编辑状态检测
通过检查 `table.getState().editingRow?.id === row.id` 来判断是否在编辑状态。

### 3. 隐藏默认编辑框
使用 `muiEditTextFieldProps: () => ({ style: { display: 'none' } })` 隐藏默认的TextField。

### 4. 正确的accessorKey
直接使用对象字段名（如 `'source'`）而不是嵌套路径（如 `'source.ip_list'`）。

## 修复后的效果

1. ✅ Autocomplete 的 onChange 事件正常工作
2. ✅ 编辑状态正确更新到 `_valuesCache`
3. ✅ 保存时能获取到正确的值
4. ✅ UI 响应正常，用户体验良好
5. ✅ 与 Material React Table 的编辑流程完全兼容

## 注意事项

1. 确保 `ipOptions` 数组在 `useMemo` 中正确缓存
2. 在 `columns` 的依赖数组中包含 `ipOptions`
3. `isOptionEqualToValue` 函数要正确比较选项
4. 处理 `null` 值的情况
5. 在 `onEditingRowSave` 中正确处理编辑后的值

## 调试技巧

添加 console.log 来追踪状态变化：
```javascript
onChange={(event, newValue) => {
  console.log('Autocomplete onChange:', newValue);
  console.log('Current editing row:', table.getState().editingRow);
  // ... 更新逻辑
}}
```