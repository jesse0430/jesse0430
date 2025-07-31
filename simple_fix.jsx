// 最简单的修复方案 - 直接替换你的 Source IP 列配置

{
    accessorKey: 'source',
    header: 'Source IP',
    filterVariant: 'autocomplete',
    filterSelectOptions: ipOptions,
    filterFn: 'fuzzy',
    muiEditTextFieldProps: ({ cell, row, table }) => {
        // 简化获取当前值的逻辑
        const originalValue = row.original?.source;
        const editingRow = table.getState().editingRow;
        const cachedValue = editingRow?._valuesCache?.source;
        
        // 当前显示的值 - 优先使用缓存值，否则使用原始值
        const displayValue = cachedValue || originalValue;
        
        console.log('当前行数据:', row.original);
        console.log('原始source值:', originalValue);
        console.log('显示值:', displayValue);
        
        return {
            select: true,
            // 关键：使用 pk 作为 value 进行比较
            value: displayValue?.pk || '',
            onChange: (event) => {
                const selectedOption = event.target.value;
                console.log('选择了:', selectedOption);
                
                // 更新编辑行的值
                if (editingRow) {
                    table.setEditingRow({
                        ...editingRow,
                        _valuesCache: {
                            ...editingRow._valuesCache,
                            source: selectedOption,
                        },
                    });
                }
            },
            children: ipOptions.map((option) => (
                <MenuItem 
                    key={option.pk} 
                    value={option.pk}  // 使用 pk 作为 value
                    selected={option.pk === displayValue?.pk}  // 明确设置选中状态
                >
                    <Tooltip title={<pre>{option.ip_list}</pre>} placement="right" arrow>
                        <span>
                            {option.name
                                ? `${option.name} (${option.site})`
                                : `${option.ip_list?.split('\r\n')[0].slice(0, 50)}... (${option.site})`}
                        </span>
                    </Tooltip>
                </MenuItem>
            )),
        };
    },
    accessorFn: (row) => {
        return row.source?.name
            ? `${row.source.name} (${row.source.site})`
            : `${row.source?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${row.source?.site})` || '';
    },
}

// 如果上面还是不行，试试这个更简单的版本：

{
    accessorKey: 'source',
    header: 'Source IP',
    filterVariant: 'autocomplete',
    filterSelectOptions: ipOptions,
    filterFn: 'fuzzy',
    muiEditTextFieldProps: ({ cell, row, table }) => ({
        select: true,
        defaultValue: row.original?.source?.pk || '',  // 使用 defaultValue
        onChange: (event) => {
            const selectedPk = event.target.value;
            const selectedOption = ipOptions.find(opt => opt.pk === selectedPk);
            console.log('选择了:', selectedOption);
            
            // 更新编辑行的值
            const editingRow = table.getState().editingRow;
            if (editingRow) {
                table.setEditingRow({
                    ...editingRow,
                    _valuesCache: {
                        ...editingRow._valuesCache,
                        source: selectedOption,
                    },
                });
            }
        },
        children: ipOptions.map((option) => (
            <MenuItem key={option.pk} value={option.pk}>
                <Tooltip title={<pre>{option.ip_list}</pre>} placement="right" arrow>
                    <span>
                        {option.name
                            ? `${option.name} (${option.site})`
                            : `${option.ip_list?.split('\r\n')[0].slice(0, 50)}... (${option.site})`}
                    </span>
                </Tooltip>
            </MenuItem>
        )),
    }),
    accessorFn: (row) => {
        return row.source?.name
            ? `${row.source.name} (${row.source.site})`
            : `${row.source?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${row.source?.site})` || '';
    },
}