// 最终修复版本 - 解决选择时字段不更新的问题

{
    accessorKey: 'source',
    header: 'Source IP',
    filterVariant: 'autocomplete',
    filterSelectOptions: ipOptions,
    filterFn: 'fuzzy',
    muiEditTextFieldProps: ({ cell, row, table }) => {
        // 获取当前编辑行的状态
        const editingRow = table.getState().editingRow;
        const cachedValue = editingRow?._valuesCache?.source;
        const originalValue = row.original?.source;
        
        // 当前显示的值：优先使用缓存值，否则使用原始值
        const currentValue = cachedValue || originalValue;
        
        return {
            select: true,
            value: currentValue?.pk || '',  // 使用pk作为value
            onChange: (event) => {
                const selectedPk = event.target.value;
                const selectedOption = ipOptions.find(opt => opt.pk === selectedPk);
                
                console.log('选择了:', selectedOption);
                
                // 关键：更新编辑行的缓存值
                if (editingRow) {
                    table.setEditingRow({
                        ...editingRow,
                        _valuesCache: {
                            ...editingRow._valuesCache,
                            source: selectedOption,  // 存储完整的对象
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
        };
    },
    accessorFn: (row) => {
        return row.source?.name
            ? `${row.source.name} (${row.source.site})`
            : `${row.source?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${row.source?.site})` || '';
    },
}

// Destination IP 列的相同修复
{
    accessorKey: 'destination',
    header: 'Destination IP',
    filterVariant: 'autocomplete',
    filterSelectOptions: ipOptions,
    filterFn: 'equals',
    muiEditTextFieldProps: ({ cell, row, table }) => {
        // 获取当前编辑行的状态
        const editingRow = table.getState().editingRow;
        const cachedValue = editingRow?._valuesCache?.destination;
        const originalValue = row.original?.destination;
        
        // 当前显示的值：优先使用缓存值，否则使用原始值
        const currentValue = cachedValue || originalValue;
        
        return {
            select: true,
            value: currentValue?.pk || '',  // 使用pk作为value
            onChange: (event) => {
                const selectedPk = event.target.value;
                const selectedOption = ipOptions.find(opt => opt.pk === selectedPk);
                
                console.log('Destination 选择了:', selectedOption);
                
                // 关键：更新编辑行的缓存值
                if (editingRow) {
                    table.setEditingRow({
                        ...editingRow,
                        _valuesCache: {
                            ...editingRow._valuesCache,
                            destination: selectedOption,  // 存储完整的对象
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
        };
    },
    accessorFn: (row) => {
        const destination = row.destination;
        return destination?.name
            ? `${destination.name} (${destination.site})`
            : `${destination?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${destination?.site})` || '';
    },
}