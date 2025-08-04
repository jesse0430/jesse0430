'use client';

import { useDispatch, useSelector, Provider } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { Box, Button, IconButton, Tooltip, Grid, MenuItem, Autocomplete, TextField, Select } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import isEquil from 'lodash.isequal';

import { updateMultipleFirewallValue } from '../store/slices/FirewallSlice';
import { store } from '../store'

const ENV_LIST = ['N/A', 'TE', 'OA', 'SFCS', 'Te_Firewall', 'PSE', 'QE', 'RDT', 'SFCS']

const _updateTableData = (table, key, value) => {
    const editingRow = table.getState().editingRow;
    if (editingRow) {
        const newRow = {
            ...editingRow,
            original: {
                ...editingRow.original,
                [key]: value,
            },
        };
        table.setEditingRow(newRow);
        console.log(table.getState().editingRow.original)
    }
}

const FirewallTable = ({ initialPolicies, allList }) => {
    const dispatch = useDispatch();
    const { policy_list=[], loading, error } = useSelector((state) => state.firewall);
    const [tableData, setTableData] = useState([]);
    const [siteOpen, setSiteOpen] = useState(false)
    const [ targetPolicy, setTargetPolicy ] = useState({})

    const { ipOptions, siteOptions, portOptions } = useMemo(() => {
        return {
            ipOptions: [...(allList?.ip_list || [])],
            siteOptions: [...(allList?.sites || [])],
            portOptions: [...(allList?.ports || [])],
        };
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
        setTableData(tempData)
    }, [policy_list]);

    const sendCreatePolicy = async ({ values, table }) => {
        console.log(values)
        console.log(table)
        // dispatch({ type: 'firewall/createPolicySaga', payload: values });
        // table.setCreatingRow(null);
    };

    const sendEditPolicy = async ({ values, table }) => {
        const newValues = table.getState().editingRow.original;
        const output = {};
        console.log('new: ', newValues)
        console.log('old: ', targetPolicy)
        Object.keys(newValues).map((key) => {
            const newVal = newValues[key];
            const targetVal = targetPolicy[key]
            if (['source', 'destination'].includes(key)) {
                if (!isEquil(newVal, targetVal)) {
                    output[key] = newVal?.pk
                }
            } else if (['requester', 'description', 'env'].includes(key)) {
                if (newVal !== targetVal) {
                    output[key] = newVal;
                }
            } else if (key === 'port') {
                if (!isEquil(newVal, targetVal)) {
                    output[key] = newVal.map(item => item?.pk);
                }
            }
        });
        console.log('diff:', output);
        dispatch({ type: 'firewall/updatePolicySaga', payload: {body: output, pk: newValues?.pk} });
        table.setEditingRow(null);
    };

    // const openDeleteConfirmModal = (row) => {
    //     if (window.confirm('Are you sure you want to delete this policy')) {
    //         table.getSelectedRowModel().flatRows.map((row) => {
    //             alert('deactivating '  row.getValue('name'));
    //           });
    //         // dispatch({ type: 'firewall/deletePolicySaga', payload: row.original?.pk });
    //     }
    // };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'site',
                header: 'Site',
                filterVariant: 'autocomplete',
                filterSelectOptions: siteOptions,
                filterFn: 'fuzzy',
                Edit: ({ cell, column, row, table }) => {
                    const [value, setValue] = useState(row.original?.site || null);
                    return (
                        siteOpen ? (
                            <Autocomplete
                                fullWidth
                                options={siteOptions}
                                value={value}
                                onChange={(event, newValue) => {
                                    setValue(newValue);
                                    _updateTableData(table, 'site', newValue)
                                }}
                                getOptionLabel={(option) => {
                                    if (!option) return '';
                                    return option.name ? option.name.toUpperCase() : (typeof option === 'string' ? option.toUpperCase() : '');
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        fullWidth
                                        value={params.inputProps.value}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.pk || option.id || option}>
                                        {option.name ? option.name.toUpperCase() : (typeof option === 'string' ? option.toUpperCase() : '')}
                                    </li>
                                )}
                                openOnFocus={true}
                                autoHighlight={true}
                            />
                        ) : (
                            <TextField
                                variant="standard"
                                fullWidth
                                value={value?.name?.toUpperCase() || value?.toUpperCase() || ''}
                                disabled
                            />
                        )
                    );
                },
                accessorFn: (row) => (row.site?.name?.toUpperCase() || row.site?.toUpperCase() || ''),
            },
            {
                accessorKey: 'env',
                header: 'ENV',
                filterVariant: 'autocomplete',
                filterSelectOptions: ENV_LIST,
                filterFn: 'fuzzy',
                Edit: ({ cell, column, row, table }) => {
                    const [value, setValue] = useState(row.original?.env || null);
                    return (
                        <Autocomplete
                            fullWidth
                            options={ENV_LIST}
                            value={value}
                            onChange={(event, newValue) => {
                                setValue(newValue);
                                _updateTableData(table, 'env', newValue)
                            }}
                            getOptionLabel={(option) => option || ''}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard" 
                                    fullWidth
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option}>
                                    {option}
                                </li>
                            )}
                            openOnFocus={true}
                            autoHighlight={true}
                        />
                    );
                },
                accessorFn: (row) => (row.env),
            },
            {
                accessorKey: 'source',
                header: 'Source IP',
                filterVariant: 'autocomplete',
                filterSelectOptions: ipOptions,
                filterFn: 'fuzzy',
                Edit: ({ cell, column, row, table }) => {
                    const [value, setValue] = useState(row.original?.source || null);
                    
                    return (
                        <Autocomplete
                            fullWidth
                            options={ipOptions}
                            value={value}
                            onChange={(event, newValue) => {
                                setValue(newValue);
                                _updateTableData(table, 'source', newValue)
                            }}
                            getOptionLabel={(option) => {
                                if (!option) return '';
                                return option?.name
                                    ? `${option.name} (${option.site})`
                                    : `${option?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${option?.site})`;
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard" 
                                    fullWidth
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.pk || option.id}>
                                    <Tooltip title={<pre>{option.ip_list}</pre>} placement="right" arrow>
                                        <span>
                                            {option.name
                                                ? `${option.name} (${option.site})`
                                                : `${option.ip_list?.split('\r\n')[0].slice(0, 50)}... (${option.site})`}
                                        </span>
                                    </Tooltip>
                                </li>
                            )}
                            openOnFocus={true}
                            autoHighlight={true}
                        />
                    );
                },
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
                Edit: ({ cell, column, row, table }) => {
                    const [value, setValue] = useState(row.original?.destination || null);
                    
                    return (
                        <Autocomplete
                            fullWidth
                            options={ipOptions}
                            value={value}
                            onChange={(event, newValue) => {
                                setValue(newValue);
                                _updateTableData(table, 'destination', newValue)
                            }}
                            getOptionLabel={(option) => {
                                if (!option) return '';
                                return option?.name
                                    ? `${option.name} (${option.site})`
                                    : `${option?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${option?.site})`;
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard" 
                                    fullWidth
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.pk || option.id}>
                                    <Tooltip title={<pre>{option.ip_list}</pre>} placement="right" arrow>
                                        <span>
                                            {option.name
                                                ? `${option.name} (${option.site})`
                                                : `${option.ip_list?.split('\r\n')[0].slice(0, 50)}... (${option.site})`}
                                        </span>
                                    </Tooltip>
                                </li>
                            )}
                            openOnFocus={true}
                            autoHighlight={true}
                        />
                    );
                },
                accessorFn: (row) => {
                    const destination = row.destination;
                    return destination?.name
                        ? `${destination.name} (${destination.site})`
                        : `${destination?.ip_list?.split('\r\n')[0].slice(0, 50)}... (${destination?.site})` || '';
                },
            },
            {
                accessorKey: 'port',
                header: 'Port',
                filterVariant: 'autocomplete',
                filterSelectOptions: portOptions,
                size: 300,
                filterFn: 'equals',
                Edit: ({ cell, column, row, table }) => {
                    const [value, setValue] = useState(row.original?.port || []);

                    return (
                        <Autocomplete
                            multiple
                            limitTags={2}
                            fullWidth
                            disableCloseOnSelect
                            options={portOptions}
                            value={value}
                            onChange={(event, newValue) => {
                                setValue(newValue);
                                _updateTableData(table, 'port', newValue)
                            }}
                            getOptionLabel={(option) => {
                                if (!option) return '';
                                if (Array.isArray(option)) {
                                    return option.length < 3
                                        ? option.map(port => port?.name || '').join(', ')
                                        : `${option.slice(0, 3).map(port => port?.name || '').join(', ')}...`;
                                }
                                return option.name || '';
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard" 
                                    fullWidth
                                />
                            )}
                            renderOption={(props, option) => (
                                option?.is_group ? (
                                    <li {...props} key={option.pk || option.id}>
                                        <Tooltip 
                                            title={<pre>
                                                {(() => {
                                                    const names = option?.members?.map(port => port?.name) || [];
                                                    return names
                                                        .reduce((acc, curr, idx) => {
                                                            if (idx % 5 === 0 && idx !== 0) acc += '\n';
                                                            acc += (idx % 5 === 0 ? '' : ', ') + curr;
                                                            return acc;
                                                        }, '');
                                                })()}
                                            </pre>
                                            } 
                                            placement="right" 
                                            arrow
                                        >
                                            <span>
                                                {option.name}
                                            </span>
                                        </Tooltip>
                                    </li>
                                ) : (
                                    <li {...props} key={option.pk || option.id}>
                                        {option.name}
                                    </li>
                                )
                            )}
                            openOnFocus={true}
                            autoHighlight={true}
                        />
                    );
                },
                accessorFn: (row) => (
                    row.port?.length < 3
                        ? row.port.map(port => port?.name).join(', ')
                        : `${row.port?.slice(0, 3).map(port => port?.name).join(', ')}...` || ''
                ),
            },
            {
                accessorKey: 'description',
                header: 'Description',
                Edit: ({ cell, column, row, table }) => {
                    const [value, setValue] = useState(row.original?.description || '');

                    return (
                        <TextField
                            variant="standard" 
                            fullWidth
                            value={value}
                            onChange={(event) => {
                                setValue(event.target.value)
                                _updateTableData(table, 'description', event.target.value)
                            }}
                        />
                    );
                },
            },
            {
                accessorKey: 'requester',
                header: 'Requester',
                Edit: ({ cell, column, row, table }) => {
                    const [value, setValue] = useState(row.original?.requester || '');

                    return (
                        <TextField
                            variant="standard" 
                            fullWidth
                            value={value}
                            onChange={(event) => {
                                setValue(event.target.value)
                                _updateTableData(table, 'requester', event.target.value)
                            }}
                        />
                    );
                },
            },
        ],
        [ipOptions, siteOptions, portOptions],
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
        // enableRowVirtualization: true,
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
                    <IconButton onClick={() => {
                        table.setEditingRow(row)
                        setTargetPolicy(row.original)
                    }}>
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
            columnPinning: { 
                left: ['mrt-row-select'], 
                right: ['mrt-row-actions'], 
            },
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