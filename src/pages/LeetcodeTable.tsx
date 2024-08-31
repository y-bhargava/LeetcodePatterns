import { useEffect, useState } from 'react';
import {
    Column,
    useReactTable,
    createColumnHelper,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    ColumnFiltersState,
    RowData,
} from '@tanstack/react-table';
import { Box, CircularProgress, Typography, Select, MenuItem, Button, TextField, Autocomplete,Chip} from '@mui/material';
import Grid from '@mui/material/Grid2';
import problems from '../assets/problems.json';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { DebounceInput } from 'react-debounce-input';

const filterTags = (row: any, columnId: string, filterValue: string[]) => {
    const rowTags = row.getValue(columnId).split(', ');
    return filterValue.every(tag => rowTags.includes(tag));
};

const tagsDict = [
    'Array',
    'Backtracking',
    'Biconnected Component',
    'Binary Indexed Tree',
    'Binary Search',
    'Binary Search Tree',
    'Binary Tree',
    'Bit Manipulation',
    'Bitmask',
    'Brainteaser',
    'Breadth-First Search',
    'Bucket Sort',
    'Combinatorics',
    'Concurrency',
    'Counting',
    'Counting Sort',
    'Data Stream',
    'Database',
    'Depth-First Search',
    'Design',
    'Divide and Conquer',
    'Doubly-Linked List',
    'Dynamic Programming',
    'Enumeration',
    'Eulerian Circuit',
    'Game Theory',
    'Geometry',
    'Graph',
    'Greedy',
    'Hash Function',
    'Hash Table',
    'Heap (Priority Queue)',
    'Interactive',
    'Iterator',
    'Line Sweep',
    'Linked List',
    'Math',
    'Matrix',
    'Memoization',
    'Merge Sort',
    'Minimum Spanning Tree',
    'Monotonic Queue',
    'Monotonic Stack',
    'Number Theory',
    'Ordered Set',
    'Prefix Sum',
    'Probability and Statistics',
    'Queue',
    'Quickselect',
    'Radix Sort',
    'Randomized',
    'Recursion',
    'Rejection Sampling',
    'Reservoir Sampling',
    'Rolling Hash',
    'Segment Tree',
    'Shell',
    'Shortest Path',
    'Simulation',
    'Sliding Window',
    'Sorting',
    'Stack',
    'String',
    'String Matching',
    'Strongly Connected Component',
    'Suffix Array',
    'Topological Sort',
    'Tree',
    'Trie',
    'Two Pointers',
    'Union Find'
  ]


interface Problem {
    title: string;
    number: string;
    id: number;
    difficulty: string;
    likes: number;
    dislikes: number;
    likesRatio: number;
    Accepted: string;
    Submission: string;
    AcceptanceRate: number;
    topicTags: string;
}

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: 'text' | 'range' | 'select' | 'tags';
    }
}

const difficultyColors: { [key: string]: string } = {
    Easy: '#00FF00',
    Medium: '#FFA500',
    Hard: '#FF0000',
};

const difficultyOrder: { [key: string]: number } = {
    Easy: 1,
    Medium: 2,
    Hard: 3,
};

const columnHelper = createColumnHelper<Problem>();


function parseProblems(problems: any[]): Problem[] {
    return problems.map((problem) => ({
        id: problem.number,
        title: `${problem.titleId}, ${problem.title}`,
        number: problem.number,
        difficulty: problem.difficulty,
        likes: problem.likes,
        dislikes: problem.dislikes,
        likesRatio: problem.likes / (problem.likes + problem.dislikes),
        Accepted: problem.AcceptedRaw,
        Submission: problem.SubmissionRaw,
        AcceptanceRate: problem.AcceptanceRate,
        topicTags: problem.topicTags.map((tag: any) => tag.name).join(', '),
    }));
}

export default function LeetcodeTable() {
    const [data, setData] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const columns: ColumnDef<Problem, any>[] = [
        columnHelper.accessor('number', {
            header: () => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '100%' }}>
                    Number
                </div>
            ),
            cell: (info) => <span>{parseInt(info.getValue(), 10)}</span>,
            size: 80,
        }),
        columnHelper.accessor('title', {
            header: () => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '100%' }}>
                    Title
                </div>
            ),
            size: 500,
            cell: (info) => {
                const title = info.getValue().split(',')[1];
                const link = info.getValue().split(',')[0];
                return (
                    <a href={`https://leetcode.com/problems/${link}`} target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'none' }}>
                        {title}
                    </a>
                );
            },
        }),
        columnHelper.accessor('difficulty', {
            header: () => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '100%' }}>
                    Difficulty
                </div>
            ),
            cell: (info) => {
                const difficulty = info.getValue();
                return (
                    <span style={{ color: difficultyColors[difficulty] }}>
                        {info.getValue()}
                    </span>
                );
            },
            meta: {
                filterVariant: 'select',
            },
            sortingFn: (rowA, rowB) => difficultyOrder[rowA.original.difficulty] - difficultyOrder[rowB.original.difficulty],
            size: 100
        }),
        columnHelper.accessor('likes', {
            enableColumnFilter: false,
            header: ({ }) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '100%' }}>
                    <ThumbUpIcon style={{ color: '#00FF00', fontSize: '1.5rem' }} />
                    Likes
                </div>
            ),
            size: 80,
        }),
        columnHelper.accessor('dislikes', {
            enableColumnFilter: false,
            header: () => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <ThumbDownIcon style={{ color: '#FF0000', fontSize: '1.5rem' }} />
                    Dislikes
                </div>
            ),
            size: 80,
        }),
        columnHelper.accessor('likesRatio', {
            enableColumnFilter: false,
            header: () => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '100%' }}>
                    Like Ratio
                </div>
            ),
            cell: (info) => (
                <span>
                    {(Math.round(info.getValue() * 100) / 100).toFixed(2)}
                </span>
            ),
            size: 80,
        }),
        columnHelper.accessor('Accepted', {
            enableColumnFilter: false,
            header: () => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '100%' }}>
                    Accepted
                </div>
            ),
            size: 120,
        }),
        columnHelper.accessor('Submission', {
            enableColumnFilter: false,
            header: () => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '100%' }}>
                    Submissions
                </div>
            ),
            size: 120,
        }),
        columnHelper.accessor('AcceptanceRate', {
            enableColumnFilter: false,
            header: () => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '100%' }}>
                    Acceptance
                </div>
            ),
            cell: (info) => (
                <span>
                    {(Math.round(info.getValue() * 100) / 100).toFixed(2) + '%'}
                </span>
            ),
            size: 50,
        }),
        columnHelper.accessor('topicTags', {
            header: () => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '100%' }}>
                    Tags
                </div>
            ),
            cell: (info) => {
                return info.getValue();
            },
            size: 300,
            filterFn: filterTags,
            meta: {
                filterVariant: 'tags'
            },
        }),
    ];

    useEffect(() => {
        const processedData = parseProblems(problems);
        setData(processedData);
        setLoading(false);
    }, []);

    const table = useReactTable({
        data,
        columns,
        defaultColumn: {
            size: 100,
            minSize: 50,
            maxSize: 200,
        },
        columnResizeMode: 'onChange',
        filterFns: {
            filterTags
        },
        state: {
            pagination,
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        debugTable: true,
        debugHeaders: true,
        debugColumns: false,
    });

    return (
        <>
            {loading ? (
                <Box
                    sx={{
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgb(26 26 26/var(--tw-bg-opacity))',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <CircularProgress color="inherit" />
                </Box>
            ) : (
                <Grid container spacing={0} style={{ backgroundColor: 'rgb(26 26 26/var(--tw-bg-opacity))' }}>
                    <Grid size={12}>
                        <Typography
                            variant="h3"
                            style={{
                                color: '#e8e8e8',
                                textAlign: 'center',
                                fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji',
                                fontWeight: '600',
                                padding: '20px',
                            }}
                        >
                            Leetcode Problems
                        </Typography>
                    </Grid>
                    <Grid
                        size={12}
                        container
                        padding={0}
                    >
                        <div style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#1C1C1C',
                            flexDirection: 'column',
                            paddingTop: '20px'
                        }}>
                            <table>
                                <thead style={{ paddingBottom: '10px',verticalAlign:'top' }}>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    colSpan={header.colSpan}
                                                    style={{
                                                        width: `${header.getSize()}px`,
                                                        position: 'relative',
                                                        paddingBottom: '20px',
                                                        fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji'
                                                    }}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <>
                                                            <div
                                                                {...{
                                                                    className: header.column.getCanSort()
                                                                        ? 'cursor-pointer select-none'
                                                                        : '',
                                                                    onClick: header.column.getToggleSortingHandler(),
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        position: 'relative',
                                                                        gap: '0.5rem',
                                                                        cursor:'pointer'
                                                                    }
                                                                }}
                                                            >
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                                {header.column.getIsSorted() ? (
                                                                    <span style={{ marginLeft: '0.25rem' }}>
                                                                        {{
                                                                            asc: '🔼',
                                                                            desc: '🔽',
                                                                        }[header.column.getIsSorted() as string] ?? null}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            {header.column.getCanFilter() ? (
                                                                <div>
                                                                    <Filter column={header.column} />
                                                                </div>
                                                            ) : null}
                                                            {/* Add inline styling for the resize handle */}
                                                            <div
                                                                {...{
                                                                    onMouseDown: header.getResizeHandler(),
                                                                    onTouchStart: header.getResizeHandler(),
                                                                    style: {
                                                                        display: 'inline-block',
                                                                        background: header.column.getIsResizing()
                                                                            ? '#000'
                                                                            : 'transparent',
                                                                        width: '5px',
                                                                        cursor: 'col-resize',
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        right: 0,
                                                                        bottom: 0,
                                                                        zIndex: 1,
                                                                        touchAction: 'none',
                                                                        opacity: header.column.getIsResizing() ? 0.2 : 1,
                                                                    },
                                                                }}
                                                            />
                                                        </>
                                                    )}

                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map((row, visibleRowIndex) => (
                                        <tr
                                            key={row.id}
                                            style={{
                                                backgroundColor: visibleRowIndex % 2 === 0 ? '#1C1C1C' : '#333333',
                                                fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji'
                                            }}
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <td
                                                    key={cell.id}
                                                    style={{
                                                        padding: '8px',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>

                            </table>


                            {/* Pagination controls */}
                            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '50px' }}>
                                <Button
                                    sx={{ backgroundColor: '#333333', color: '#1976d2' }}
                                    onClick={() => {
                                        table.setPageIndex(0);
                                        setTimeout(() => {
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }, 100);
                                    }}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {'<<'}
                                </Button>
                                <Button
                                    sx={{ backgroundColor: '#333333', color: '#1976d2' }}
                                    onClick={() => {
                                        table.previousPage();
                                        setTimeout(() => {
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }, 100);
                                    }}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {'<'}
                                </Button>
                                <span className="flex items-center gap-1">
                                    Page{' '}
                                    <strong>
                                        {table.getState().pagination.pageIndex + 1} of{' '}
                                        {table.getPageCount()}
                                    </strong>
                                </span>
                                <Button
                                    sx={{ backgroundColor: '#333333', color: '#1976d2' }}
                                    onClick={() => {
                                        table.nextPage();
                                        setTimeout(() => {
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }, 100);
                                    }}
                                    disabled={!table.getCanNextPage()}
                                >
                                    {'>'}
                                </Button>
                                <Button
                                    sx={{ backgroundColor: '#333333', color: '#1976d2' }}
                                    onClick={() => {
                                        table.setPageIndex(table.getPageCount() - 1);
                                        setTimeout(() => {
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }, 100);
                                    }}
                                    disabled={!table.getCanNextPage()}
                                >
                                    {'>>'}
                                </Button>

                                <Select
                                    sx={{ backgroundColor: '#333333', color: 'white' }}
                                    value={table.getState().pagination.pageSize}
                                    onChange={(e) => {
                                        table.setPageSize(Number(e.target.value));
                                        setTimeout(() => {
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }, 100);
                                    }}
                                >
                                    {[20, 50, 100, 200].map(pageSize => (
                                        <MenuItem key={pageSize} value={pageSize}>
                                            Show {pageSize}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>

                        </div>
                    </Grid>
                </Grid>
            )}
        </>
    );

    function Filter<TData, TValue>({ column }: { column: Column<TData, TValue> }) {
        const columnFilterValue = column.getFilterValue();
        const { filterVariant } = column.columnDef.meta ?? {};

        return filterVariant === 'range' ? (
            <div>
                <DebounceInput
                    element={TextField}
                    debounceTimeout={300}
                    type="number"
                    value={(columnFilterValue as [number, number])?.[0] ?? ''}
                    onChange={(e) =>
                        column.setFilterValue([Number(e.target.value), (columnFilterValue as [number, number])?.[1]])
                    }
                    placeholder={`Min`}
                    variant="outlined"
                    sx={{
                        "& .MuiInputBase-input": { fontSize: 16, height: 4, padding: 1, width: '100%', color: 'white' },
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                                borderColor: 'white',
                            },
                            '&:hover fieldset': {
                                borderColor: 'gray',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#1976d2',
                            },
                        },
                    }}
                />
                <DebounceInput
                    element={TextField}
                    debounceTimeout={300}
                    type="number"
                    value={(columnFilterValue as [number, number])?.[1] ?? ''}
                    onChange={(e) =>
                        column.setFilterValue([(columnFilterValue as [number, number])?.[0], Number(e.target.value)])
                    }
                    placeholder={`Max`}
                    variant="outlined"
                    sx={{
                        "& .MuiInputBase-input": { fontSize: 16 },
                        width: '100px',
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                                borderColor: 'white',
                            },
                            '&:hover fieldset': {
                                borderColor: 'gray',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#1976d2',
                            },
                        },
                    }}
                />
            </div>
        ) : filterVariant === 'select' ? (
            <Select
                value={columnFilterValue?.toString() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                variant="outlined"
                displayEmpty
                sx={{
                    "& .MuiInputBase-input": { fontSize: 16 },
                    color: 'white',
                    '& .MuiSelect-outlined': {
                        color: 'white',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'gray',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                    },
                    '& .MuiSelect-select:focus': {
                        backgroundColor: 'transparent',
                    },
                    '& .MuiSelect-icon': {
                        color: 'white',
                    },
                }}
                renderValue={(selected) => {
                    if (!selected) {
                        return <em style={{ color: 'white' }}>All</em>;
                    }
                    return selected;
                }}
            >
                <MenuItem value="">
                    <em>All</em>
                </MenuItem>
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
            </Select>
        ) :
            filterVariant === 'tags' ? (
                <Autocomplete
                multiple
                id="tags-outlined"
                options={tagsDict.filter(tag => !(columnFilterValue as string[] || []).includes(tag))}
                value={columnFilterValue as TValue[] || []}
                onChange={(_, value) => {
                    column.setFilterValue(value); // Set the selected tag names for filtering
                }}
                renderTags={(value: string[], getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            label={option}
                            {...getTagProps({ index })}
                            sx={{ color: 'white', backgroundColor: '#1976d2' }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        id="tags-autocomplete"
                        name="tags"
                        variant="outlined"
                        label="Tags"
                        placeholder="Select Tags"
                        sx={{
                            "& .MuiInputBase-input": { fontSize: 16, padding: 1, color: 'white' },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'gray',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#1976d2',
                            },
                            '& .MuiChip-root': {
                                color: 'white',
                                backgroundColor: '#1976d2',
                            },
                        }}
                    />
                )}
                sx={{
                    color: 'white',
                    '& .MuiAutocomplete-tag': {
                        color: 'white',
                        backgroundColor: '#1976d2',
                    },
                    '& .MuiInputBase-root': {
                        color: 'white',
                    },
                    '& .MuiSvgIcon-root': {
                        color: 'white',
                    },
                    '& .MuiAutocomplete-popupIndicator': {
                        color: 'white',
                    },
                    '& .MuiAutocomplete-clearIndicator': {
                        color: 'white',
                    },
                    '& .MuiPaper-root': {
                        backgroundColor: '#333333',
                        color: 'white',
                    },
                    '& .MuiAutocomplete-option': {
                        color: 'white',
                        '&[aria-selected="true"]': {
                            backgroundColor: '#1976d2',
                        },
                    },
                }}
            />


            ) :
                (
                    <DebounceInput
                        element={TextField}
                        debounceTimeout={300}
                        type="text"
                        value={(columnFilterValue ?? '') as string}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        placeholder={`Search...`}
                        size="medium"
                        id="outlined-basic" variant="outlined"
                        sx={{
                            "& .MuiInputBase-input": { fontSize: 16, color:'white'},
                            "&.MuiOutlinedInput-input": { fontSize: 16, color: 'white' },
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                    borderColor: 'white',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'gray',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#1976d2',
                                },
                            }
                        }}
                    />
                );
    }
}
