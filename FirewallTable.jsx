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
                muiEditTextFieldProps: ({ cell, row, table }) => ({
                    select: true,
                    onChange: (event) => {
                        const newValue = event.target.value;
                        console.log('Source IP onChange:', newValue);
                        
                        // 直接设置cell的值
                        cell.setValue(newValue);
                        
                        // 同时更新tableData
                        setTableData((prev) =>
                            prev.map((item) =>
                                item.id === row.original.id
                                    ? { ...item, source: newValue }
                                    : item
                            )
                        );
                    },
                    value: cell.getValue()?.pk || '',
                    children: ipOptions.map((option) => (
                        <MenuItem key={option.pk} value={option}>
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
            },
            {
                accessorKey: 'destination',
                header: 'Destination IP',
                filterVariant: 'autocomplete',
                filterSelectOptions: ipOptions,
                filterFn: 'equals',
                muiEditTextFieldProps: ({ cell, row, table }) => ({
                    select: true,
                    onChange: (event) => {
                        const newValue = event.target.value;
                        console.log('Destination IP onChange:', newValue);
                        
                        // 直接设置cell的值
                        cell.setValue(newValue);
                        
                        // 同时更新tableData
                        setTableData((prev) =>
                            prev.map((item) =>
                                item.id === row.original.id
                                    ? { ...item, destination: newValue }
                                    : item
                            )
                        );
                    },
                    value: cell.getValue()?.pk || '',
                    children: ipOptions.map((option) => (
                        <MenuItem key={option.pk} value={option}>
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