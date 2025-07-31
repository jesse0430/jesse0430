import React, { useState, useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Autocomplete, TextField, Tooltip } from '@mui/material';

const ExampleTable = () => {
  const [tableData, setTableData] = useState([
    // 示例数据
    { id: 1, source: { pk: 1, name: 'Server 1', site: 'Site A', ip_list: '192.168.1.1\r\n192.168.1.2' } },
    { id: 2, source: { pk: 2, name: 'Server 2', site: 'Site B', ip_list: '10.0.0.1\r\n10.0.0.2' } },
  ]);

  const ipOptions = [
    { pk: 1, name: 'Server 1', site: 'Site A', ip_list: '192.168.1.1\r\n192.168.1.2' },
    { pk: 2, name: 'Server 2', site: 'Site B', ip_list: '10.0.0.1\r\n10.0.0.2' },
    { pk: 3, name: 'Server 3', site: 'Site C', ip_list: '172.16.0.1\r\n172.16.0.2' },
  ];

  const columns = useMemo(() => [
    {
      accessorKey: 'source.ip_list',
      header: 'Source IP',
      filterVariant: 'autocomplete',
      filterSelectOptions: ipOptions,
      filterFn: 'fuzzy',
      
      // 修复1: 使用Cell而不是muiEditTextFieldProps进行自定义渲染
      Cell: ({ cell, row, table }) => {
        const isEditing = table.getState().editingRow?.id === row.id;
        
        if (!isEditing) {
          // 非编辑模式下的显示
          const source = row.original.source;
          return source?.name
            ? `${source.name} (${source.site})`
            : `${source?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${source?.site})` || '';
        }
        
        // 编辑模式下返回Autocomplete组件
        return (
          <Autocomplete
            size="small"
            options={ipOptions}
            getOptionLabel={(option) =>
              option.name
                ? `${option.name} (${option.site})`
                : `${option.ip_list?.split('\r\n')[0].slice(0, 50)}... (${option.site})`
            }
            isOptionEqualToValue={(option, value) => option.pk === (value?.pk ?? null)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                fullWidth
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.pk}>
                <Tooltip title={<pre>{option.ip_list}</pre>} placement="right" arrow>
                  <span>
                    {option.name
                      ? `${option.name} (${option.site})`
                      : `${option.ip_list?.split('\r\n')[0].slice(0, 50)}... (${option.site})`}
                  </span>
                </Tooltip>
              </li>
            )}
            onChange={(event, newValue) => {
              // 修复2: 正确更新编辑状态和表格数据
              console.log('Autocomplete onChange triggered:', newValue);
              
              // 更新编辑行的值
              table.setEditingRow({
                ...table.getState().editingRow,
                _valuesCache: {
                  ...table.getState().editingRow?._valuesCache,
                  source: newValue,
                },
              });
            }}
            value={ipOptions.find((option) => option.pk === row.original?.source?.pk) || null}
          />
        );
      },
      
      // 修复3: 提供正确的编辑处理函数
      muiEditTextFieldProps: ({ row, table }) => ({
        style: { display: 'none' }, // 隐藏默认输入框，使用自定义Cell
      }),
      
      accessorFn: (row) => {
        return row.source?.name
          ? `${row.source.name} (${row.source.site})`
          : `${row.source?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${row.source?.site})` || '';
      },
    },
  ], [ipOptions]);

  // 修复4: 正确处理编辑保存
  const handleSaveRow = ({ exitEditingMode, row, values }) => {
    console.log('Saving row:', values);
    
    setTableData((prev) =>
      prev.map((item) =>
        item.id === row.original.id
          ? { ...item, source: values.source }
          : item
      )
    );
    
    exitEditingMode();
  };

  return (
    <MaterialReactTable
      columns={columns}
      data={tableData}
      enableEditing
      editDisplayMode="row" // 使用行编辑模式
      onEditingRowSave={handleSaveRow}
      muiTableContainerProps={{
        sx: { maxHeight: 500 }
      }}
    />
  );
};

export default ExampleTable;