'use client';

import { useDispatch, useSelector, Provider } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { Box, Button, IconButton, Tooltip, Grid, MenuItem, Autocomplete, TextField } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { updateMultipleFirewallValue } from '../store/slices/FirewallSlice';
import { store } from '../store'

const FirewallTable = ({ initialPolicies, allList }) => {
    const dispatch = useDispatch();
    const { policy_list = [], site_list = [], ip_list = [], port_list = [], loading, error } = useSelector((state) => state.firewall);
    const [tableData, setTableData] = useState([]);
    const [siteData, setSiteData] = useState([]);
    const [portData, setPortData] = useState([]);
    // const [ipData, setIPData] = useState([]); 
    const [siteOpen, setSiteOpen] = useState(false)
    const [targetPolicy, setTargetPolicy] = useState({});

    const ipOptions = useMemo(() => {
        const options = [...allList?.ip_list]
        return options;
    }, [allList]);

    const siteOptions = useMemo(() => {
        const options = allList?.sites.map(item => ({
            value: item.name,
            label: item.pk,
        }));
        return options;
    }, [allList]);

    useEffect(() => {
        const { sites = [], ports = [], ip_list = [] } = allList
        dispatch(updateMultipleFirewallValue({
            policy_list: initialPolicies,
            site_list: sites,
            port_list: ports,
            ip_list: ip_list,
        }));
    }, [dispatch, initialPolicies, allList]);

    useEffect(() => {
        const tempData = [...policy_list]
        const tempSite = [...site_list]
        const tempPort = [...port_list]
        const tempIP = [...ip_list]
        setTableData(tempData);
        // setIPData(tempIP)
        setPortData(tempPort)
        setSiteData(tempSite)
    }, [policy_list, site_list, port_list, ip_list]);

    const sendCreatePolicy = async ({ values, table }) => {
        console.log(values)
        console.log(table)
        // dispatch({ type: 'firewall/createPolicySaga', payload: values });
        // table.setCreatingRow(null);
    };

    const sendEditPolicy = async ({ values, table }) => {
        console.log(values)
        console.log(table)
        // dispatch({ type: 'firewall/updatePolicySaga', payload: values });
        // table.setEditingRow(null);
    };

    // const openDeleteConfirmModal = (row) => {
    //     if (window.confirm('Are you sure you want to delete this policy')) {
    //         table.getSelectedRowModel().flatRows.map((row) => {
    //             alert('deactivating ' + row.getValue('name'));
    //           });
    //         // dispatch({ type: 'firewall/deletePolicySaga', payload: row.original?.pk });
    //     }
    // };

    const handleEdit = (row) => {
        setTargetPolicy(row.original);
        table.setEditingRow(row);
    };

    // console.log("Target Policy:", targetPolicy)

    const columns = useMemo(
        () => [
            {
                accessorKey: 'site',
                header: 'Site',
                // enableEditing: siteOpen,
                // editSelectOptions: siteOptions,
                muiEditTextFieldProps: ({ values, table }) => ({
                    select: true,
                    // SelectProps: {
                    //   renderValue: (value) => value || '',
                    //   MenuProps: { PaperProps: { sx: { maxHeight: 300 } } },
                    children: siteOptions.map(item => (
                        <MenuItem key={item.value} value={item.value}>
                            {item.value}
                        </MenuItem>
                    )),
                    // },
                }),
                accessorFn: (row) => row.destination?.site === 'global' ? row.site : row.destination?.site,
            },
            {
                accessorKey: 'env',
                header: 'ENV',
                muiEditTextFieldProps: {
                    // select: true,
                },
            },
            {
                accessorKey: 'source',
                header: 'Source IP',
                filterVariant: 'autocomplete',
                filterSelectOptions: ipOptions,
                filterFn: 'fuzzy',
                // 使用Cell组件来处理编辑和显示
                Cell: ({ cell, row, table }) => {
                    const isEditing = table.getState().editingRow?.id === row.id;
                    
                    if (isEditing) {
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
                                        size="small"
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
                                    console.log('Source IP Autocomplete onChange:', newValue);
                                    
                                    // 正确更新编辑行的值
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
                                sx={{ minWidth: 200 }}
                            />
                        );
                    }
                    
                    // 非编辑状态的显示
                    const source = row.original.source;
                    return source?.name
                        ? `${source.name} (${source.site})`
                        : `${source?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${source?.site})` || '';
                },
                // 隐藏默认的编辑输入框
                muiEditTextFieldProps: () => ({
                    style: { display: 'none' },
                }),
                accessorFn: (row) => {
                    return row.source?.name
                        ? `${row.source.name} (${row.source.site})`
                        : `${row.source?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${row.source?.site})` || '';
                },
            },
            {
                accessorKey: 'destination',
                header: 'Destination IP',
                filterVariant: 'autocomplete',
                filterSelectOptions: ipOptions,
                filterFn: 'equals',
                // 使用Cell组件来处理编辑和显示，与Source IP保持一致
                Cell: ({ cell, row, table }) => {
                    const isEditing = table.getState().editingRow?.id === row.id;
                    
                    if (isEditing) {
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
                                        size="small"
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
                                    console.log('Destination IP Autocomplete onChange:', newValue);
                                    
                                    // 正确更新编辑行的值
                                    const editingRow = table.getState().editingRow;
                                    if (editingRow) {
                                        table.setEditingRow({
                                            ...editingRow,
                                            _valuesCache: {
                                                ...editingRow._valuesCache,
                                                destination: newValue,
                                            },
                                        });
                                    }
                                }}
                                value={row.original?.destination || null}
                                sx={{ minWidth: 200 }}
                            />
                        );
                    }
                    
                    // 非编辑状态的显示
                    const destination = row.original.destination;
                    return destination?.name
                        ? `${destination.name} (${destination.site})`
                        : `${destination?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${destination?.site})` || '';
                },
                // 隐藏默认的编辑输入框
                muiEditTextFieldProps: () => ({
                    style: { display: 'none' },
                }),
                accessorFn: (row) => {
                    const destination = row.destination;
                    return destination?.name
                        ? `${destination.name} (${destination.site})`
                        : `${destination?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${destination?.site})` || '';
                },
            },
            {
                accessorKey: 'description',
                header: 'Description',
                muiEditTextFieldProps: {
                    // required: true,
                },
            },
            {
                accessorKey: 'requester',
                header: 'Requester',
                muiEditTextFieldProps: {
                    // required: true,
                },
            },
        ],
        [ipOptions, siteOptions],
    );

    const table = useMaterialReactTable({
        columns,
        data: tableData,
        createDisplayMode: 'row',
        editDisplayMode: 'row',
        enableRowActions: true,
        enableRowSelection: true,
        enableColumnPinning: true,
        enableEditing: true,
        enableRowVirtualization: true,
        enableColumnFilters: true,
        getRowId: (row) => row.id,
        positionActionsColumn: 'last',
        muiTableContainerProps: {
            sx: {
                minHeight: '500px',
            },
        },
        onCreatingRowCancel: () => setSiteOpen(false),
        onCreatingRowSave: sendCreatePolicy,
        onEditingRowSave: sendEditPolicy,
        renderRowActions: ({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
                {!siteOpen && <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(row)}>
                        <Edit />
                    </IconButton>
                </Tooltip>}
            </Box>
        ),
        muiSearchTextFieldProps: {
            size: 'small',
            variant: 'outlined',
        },
        muiPaginationProps: {
            rowsPerPageOptions: [20, 40, 60, 80, 100],
            shape: 'rounded',
            variant: 'outlined',
        },
        paginationDisplayMode: 'pages',
        initialState: {
            columnPinning: { left: ['mrt-row-select'], right: ['mrt-row-actions'], },
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 20 },
        },
        renderTopToolbarCustomActions: ({ table }) => {
            const handleDelete = () => {
                const selectedPKs = table.getSelectedRowModel().flatRows.map(row => row.original?.pk);
                dispatch({ type: 'firewall/bulkDeletePolicySaga', payload: { 'id_list': selectedPKs } });
            };

            return (
                <Grid container spacing={2}>
                    <Grid>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setSiteOpen(true)
                                table.setCreatingRow(true)
                            }}
                        >
                            Create New Policy
                        </Button>
                    </Grid>
                    <Grid>
                        <Button
                            variant="contained"
                            color="error"
                            disabled={!table.getIsSomeRowsSelected()}
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </Grid>
                </Grid>
            )
        },
        state: {
            isLoading: loading,
            showAlertBanner: !!error,
            showProgressBars: loading,
        },
    });

    return (
        <Provider store={store}>
            <MaterialReactTable table={table} />
        </Provider>
    );
};

export default FirewallTable;