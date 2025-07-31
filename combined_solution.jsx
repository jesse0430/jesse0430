// 结合前面成功效果的完整解决方案
{
    accessorKey: 'source',
    header: 'Source IP',
    filterVariant: 'autocomplete',
    filterSelectOptions: ipOptions,
    filterFn: 'fuzzy',
    muiEditTextFieldProps: ({ cell, row, table }) => {
        // 获取当前编辑行的状态 (这部分之前成功了)
        const editingRow = table.getState().editingRow;
        const cachedValue = editingRow?._valuesCache?.source;
        const originalValue = row.original?.source;
        
        // 当前显示的值：优先使用缓存值，否则使用原始值
        const currentValue = cachedValue || originalValue;
        
        // 调试信息
        console.log('=== Source IP 调试 ===');
        console.log('originalValue:', originalValue);
        console.log('cachedValue:', cachedValue);
        console.log('currentValue:', currentValue);
        console.log('currentValue.pk:', currentValue?.pk);
        
        return {
            select: true,
            value: currentValue?.pk || '',  // 使用pk作为value (这个之前能预选)
            displayEmpty: true,
            
            // 尝试添加 SelectProps 来控制显示
            SelectProps: {
                renderValue: (selected) => {
                    console.log('renderValue called with:', selected);
                    if (!selected) return '';
                    
                    // 根据pk找到对应的选项
                    const option = ipOptions.find(opt => opt.pk === selected);
                    if (!option) return selected; // 如果找不到，就显示原值
                    
                    return option.name 
                        ? `${option.name} (${option.site})` 
                        : `${option.ip_list?.split('\r\n')[0].slice(0, 50)}... (${option.site})`;
                },
                displayEmpty: true,
            },
            
            onChange: (event) => {
                const selectedPk = event.target.value;
                const selectedOption = ipOptions.find(opt => opt.pk === selectedPk);
                
                console.log('onChange - selectedPk:', selectedPk);
                console.log('onChange - selectedOption:', selectedOption);
                
                // 更新编辑行的缓存值 (这部分之前成功了)
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
            
            children: [
                <MenuItem key="empty" value="" disabled>
                    <em>请选择...</em>
                </MenuItem>,
                ...ipOptions.map((option) => (
                    <MenuItem key={option.pk} value={option.pk}>
                        <Tooltip title={<pre>{option.ip_list}</pre>} placement="right" arrow>
                            <span>
                                {option.name
                                    ? `${option.name} (${option.site})`
                                    : `${option.ip_list?.split('\r\n')[0].slice(0, 50)}... (${option.site})`}
                            </span>
                        </Tooltip>
                    </MenuItem>
                ))
            ],
        };
    },
    accessorFn: (row) => {
        return row.source?.name
            ? `${row.source.name} (${row.source.site})`
            : `${row.source?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${row.source?.site})` || '';
    },
}