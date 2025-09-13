import {
    TextField,
    IndexTable,
    IndexFilters,
    useSetIndexFiltersMode,
    useIndexResourceState,
    Text,
    ChoiceList,
    Badge,
    useBreakpoints,
    Card,
} from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import type { IndexFiltersProps, TabProps } from '@shopify/polaris';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import { formatTime, getTextFromHTML, ShopifyPageId } from 'app/utils/helpers';
import { PageTableProps, PageTableValue } from 'app/types';
import "./pagetable.css";


export const PageTable = ({ listPages, setToast }: PageTableProps) => {
    const navigate = useNavigate();
    const fetcher = useFetcher();
    const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    // Tabs state
    const [itemStrings, setItemStrings] = useState([
        'All',
        'Visible',
        'Hidden'
    ]);

    const deleteView = (index: number) => {
        const newItemStrings = [...itemStrings];
        newItemStrings.splice(index, 1);
        setItemStrings(newItemStrings);
        setSelected(0);
    };

    const duplicateView = async (name: string) => {
        setItemStrings([...itemStrings, name]);
        setSelected(itemStrings.length);
        await sleep(1);
        return true;
    };

    const tabs: TabProps[] = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions:
            index === 0
                ? []
                : [
                    {
                        type: 'rename',
                        onAction: () => { },
                        onPrimaryAction: async (value: string): Promise<boolean> => {
                            const newItemsStrings = tabs.map((item, idx) => {
                                if (idx === index) {
                                    return value;
                                }
                                return item.content;
                            });
                            await sleep(1);
                            setItemStrings(newItemsStrings);
                            return true;
                        },
                    },
                    {
                        type: 'duplicate',
                        onPrimaryAction: async (value: string): Promise<boolean> => {
                            await sleep(1);
                            duplicateView(value);
                            return true;
                        },
                    },
                    {
                        type: 'edit',
                    },
                    {
                        type: 'delete',
                        onPrimaryAction: async () => {
                            await sleep(1);
                            deleteView(index);
                            return true;
                        },
                    },
                ],
    }));

    const [selected, setSelected] = useState(0);
    const onCreateNewView = async (value: string) => {
        await sleep(500);
        setItemStrings([...itemStrings, value]);
        setSelected(itemStrings.length);
        return true;
    };

    // Sort options
    const sortOptions: IndexFiltersProps['sortOptions'] = [
        { label: 'Title', value: 'title asc', directionLabel: 'A-Z' },
        { label: 'Title', value: 'title desc', directionLabel: 'Z-A' },
        { label: 'Updated', value: 'updatedAt asc', directionLabel: 'Ascending' },
        { label: 'Updated', value: 'updatedAt desc', directionLabel: 'Descending' },
    ];
    const [sortSelected, setSortSelected] = useState(['updatedAt desc']);

    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const onHandleSave = async () => {
        await sleep(1);
        return true;
    };

    const primaryAction: IndexFiltersProps['primaryAction'] =
        selected === 0
            ? {
                type: 'save-as',
                onAction: onCreateNewView,
                disabled: false,
                loading: false,
            }
            : {
                type: 'save',
                onAction: onHandleSave,
                disabled: false,
                loading: false,
            };

    // Filter states - updated for page-specific filters
    const [visibilityStatus, setVisibilityStatus] = useState<string[] | undefined>(undefined);
    const [titleFilter, setTitleFilter] = useState('');
    const [queryValue, setQueryValue] = useState('');

    // Filter handlers
    const handleVisibilityStatusChange = useCallback(
        (value: string[]) => setVisibilityStatus(value),
        [],
    );
    const handleTitleFilterChange = useCallback(
        (value: string) => setTitleFilter(value),
        [],
    );
    const handleFiltersQueryChange = useCallback(
        (value: string) => setQueryValue(value),
        [],
    );
    const handleVisibilityStatusRemove = useCallback(
        () => setVisibilityStatus(undefined),
        [],
    );
    const handleTitleFilterRemove = useCallback(() => setTitleFilter(''), []);
    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleFiltersClearAll = useCallback(() => {
        handleVisibilityStatusRemove();
        handleTitleFilterRemove();
        handleQueryValueRemove();
    }, [
        handleVisibilityStatusRemove,
        handleTitleFilterRemove,
        handleQueryValueRemove,
    ]);

    // Updated filters for pages
    const filters = [
        {
            key: 'visibilityStatus',
            label: 'Visibility',
            filter: (
                <ChoiceList
                    title="Visibility"
                    titleHidden
                    choices={[
                        { label: 'Visible', value: 'visible' },
                        { label: 'Hidden', value: 'hidden' },
                    ]}
                    selected={visibilityStatus || []}
                    onChange={handleVisibilityStatusChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: 'titleFilter',
            label: 'Title contains',
            filter: (
                <TextField
                    label="Title contains"
                    value={titleFilter}
                    onChange={handleTitleFilterChange}
                    autoComplete="off"
                    labelHidden
                />
            ),
            shortcut: true,
        },
    ];

    // Updated applied filters
    const appliedFilters: IndexFiltersProps['appliedFilters'] = [];
    if (visibilityStatus && !isEmpty(visibilityStatus)) {
        const key = 'visibilityStatus';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, visibilityStatus),
            onRemove: handleVisibilityStatusRemove,
        });
    }
    if (!isEmpty(titleFilter)) {
        const key = 'titleFilter';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, titleFilter),
            onRemove: handleTitleFilterRemove,
        });
    }

    const resourceName = {
        singular: 'page',
        plural: 'pages',
    };

    // Filter and sort pages
    const filteredAndSortedPages = useMemo(() => {
        let filtered = listPages;

        // Apply filters
        if (queryValue) {
            filtered = filtered.filter(page =>
                page.title.toLowerCase().includes(queryValue.toLowerCase()) ||
                getTextFromHTML(page.body).toLowerCase().includes(queryValue.toLowerCase())
            );
        }

        if (visibilityStatus && visibilityStatus.length > 0) {
            filtered = filtered.filter(page => {
                if (visibilityStatus.includes('visible') && visibilityStatus.includes('hidden')) {
                    return true; // Show all if both are selected
                }
                if (visibilityStatus.includes('visible')) {
                    return page.isPublished;
                }
                if (visibilityStatus.includes('hidden')) {
                    return !page.isPublished;
                }
                return true;
            });
        }

        if (titleFilter) {
            filtered = filtered.filter(page =>
                page.title.toLowerCase().includes(titleFilter.toLowerCase())
            );
        }

        // Apply tab filter
        if (selected === 1) { // Visible tab
            filtered = filtered.filter(page => page.isPublished);
        } else if (selected === 2) { // Hidden tab
            filtered = filtered.filter(page => !page.isPublished);
        }

        // Apply sorting
        if (sortSelected[0]) {
            const [field, direction] = sortSelected[0].split(' ');
            filtered = [...filtered].sort((a, b) => {
                let valA = a[field as keyof PageTableValue] ?? '';
                let valB = b[field as keyof PageTableValue] ?? '';

                if (field === 'updatedAt') {
                    valA = new Date(valA as string).getTime();
                    valB = new Date(valB as string).getTime();
                }

                if (typeof valA === 'string' && typeof valB === 'string') {
                    return direction === 'asc'
                        ? valA.localeCompare(valB)
                        : valB.localeCompare(valA);
                }

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return direction === 'asc' ? valA - valB : valB - valA;
                }

                return 0;
            });
        }

        return filtered;
    }, [listPages, queryValue, visibilityStatus, titleFilter, selected, sortSelected]);

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState<PageTableValue>(filteredAndSortedPages);

    // Better approach với pre-computed data
    const rowMarkup = useMemo(() =>
        filteredAndSortedPages.map(({ id, title, isPublished, body, updatedAt }, index) => {
            const extractedId = ShopifyPageId.extract(id);
            const pageUrl = `/pages/${encodeURIComponent(extractedId as string)}`;

            return (
                <IndexTable.Row
                    id={id}
                    key={id}
                    selected={selectedResources.includes(id)}
                    position={index}
                    onClick={() => {
                        console.log('navigate(pageUrl)>> ', pageUrl)
                        navigate(pageUrl)
                    }} // Pre-computed URL
                >
                    <IndexTable.Cell>
                        <Text fontWeight="bold" as="span">
                            {title}
                        </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                        <Badge tone={isPublished ? 'success' : 'info'}>
                            {isPublished ? 'Visible' : 'Hidden'}
                        </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{getTextFromHTML(body)}</IndexTable.Cell>
                    <IndexTable.Cell>
                        <Text as="span" alignment="end" numeric>
                            {formatTime(updatedAt)}
                        </Text>
                    </IndexTable.Cell>
                </IndexTable.Row>
            );
        }),
        [filteredAndSortedPages, selectedResources, navigate]
    );

    const promotedBulkActions = [
        {
            content: 'Set as visible',
            onAction: () => handlePromotedBulkAction('visible'),
        },
        {
            content: 'Set as hidden',
            onAction: () => handlePromotedBulkAction('hidden'),
        },
    ];

    const bulkActions = [
        {
            icon: DeleteIcon,
            destructive: true,
            content: 'Delete pages',
            onAction: () => handlePromotedBulkAction('delete'),
        },
    ];

    const handlePromotedBulkAction = useCallback((action: string) => {
        if (selectedResources.length === 0) return;
        const formData = new FormData();
        formData.append('_action', action)
        selectedResources.forEach(id => formData.append('ids[]', id));
        fetcher.submit(formData, { method: 'post' })
        if (action === 'delete') {
            setToast('Deleting page...')
        } else (
            setToast(`Setting page as ${action}...`)
        )
    }, [selectedResources, fetcher])

    type ActionResponse = {
        success: boolean;
        action: string;
        message: string;
        results: any[];
        errors?: string[];
    };
    useEffect(() => {
        const data = fetcher.data as ActionResponse | undefined;

        if (data) {
            if (data.success) {
                const actionType = data.action;
                console.log("fetcher.data >>> ", data);

                if (actionType === "delete") {
                    setToast("Page deleted");
                } else {
                    setToast(`Page set as ${actionType}`);
                }
            } else {
                console.log("Error");
            }
        }
    }, [fetcher.data]);

    return (
        <Card padding="0">
            <IndexFilters
                sortOptions={sortOptions}
                sortSelected={sortSelected}
                queryValue={queryValue}
                queryPlaceholder="Searching in all"
                onQueryChange={handleFiltersQueryChange}
                onQueryClear={() => setQueryValue('')}
                onSort={setSortSelected}
                primaryAction={primaryAction}
                cancelAction={{
                    onAction: onHandleCancel,
                    disabled: false,
                    loading: false,
                }}
                tabs={tabs}
                selected={selected}
                onSelect={setSelected}
                canCreateNewView
                onCreateNewView={onCreateNewView}
                filters={filters}
                appliedFilters={appliedFilters}
                onClearAll={handleFiltersClearAll}
                mode={mode}
                setMode={setMode}
            />
            <IndexTable
                condensed={useBreakpoints().smDown}
                resourceName={resourceName}
                itemCount={filteredAndSortedPages.length}
                selectedItemsCount={
                    allResourcesSelected ? 'All' : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                    { title: 'Title' },
                    { title: 'Visibility' },
                    { title: 'Content' },
                    { title: 'Updated', alignment: 'end' },
                ]}
                bulkActions={bulkActions}
                promotedBulkActions={promotedBulkActions}
            >
                {rowMarkup}
            </IndexTable>
        </Card>
    )
    function disambiguateLabel(key: string, value: string | any[]): string {
        switch (key) {
            case 'visibilityStatus':
                return (value as string[]).map((val) =>
                    val === 'visible' ? 'Visible' : 'Hidden'
                ).join(', ');
            case 'titleFilter':
                return `Title contains "${value}"`;
            default:
                return value as string;
        }
    }

    function isEmpty(value: string | string[]): boolean {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === '' || value == null;
        }
    }
};