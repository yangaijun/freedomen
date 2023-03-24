import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Table } from 'antd';
import Region from "../region";
import { hasPermission } from "../config/permission"
import util, { getClass, getStyle, objectMerge, splitConfig } from "../utils/util"
import { ITableProps } from "../config/type";
import { getDefaultConfigs } from "../config/config";
import { defaultPage, isRenderComponent, tableColumnProps, tablePageChangeProp, tableSelectionProp, tableSorterType } from "../config/props";

const { Column, ColumnGroup } = Table;

const keyName = 'Table'

function FTable(props: ITableProps) {
    const { style, className, columns, data, pagination, onEvent = () => { }, onChange, config } = props

    const [innerData, setInnerData] = useState<any[]>([])
    const [selecteds, setSelecteds] = useState<any[]>([])
    const [page, setPage] = useState(defaultPage)
    const innerRef = useRef<any>({ data: [] })

    const resetData = useCallback((data: any[] = [], $pIndexs?: number[], pIndex?: number): any[] => {
        const newData = []
        for (let i = 0; i < data.length; i++) {
            if (Array.isArray(data[i])) {
                newData.push(resetData(data[i]))
            } else {
                const item = {
                    key: util.getUUID(),
                    ...data[i],
                    $index: i
                }
                if (pIndex !== undefined) {
                    if ($pIndexs) {
                        item.$pIndexs = [...$pIndexs, pIndex]
                    } else {
                        item.$pIndexs = [pIndex]
                    }
                }
                if (Array.isArray(data[i].children)) {
                    item.children = resetData(data[i].children, item.$pIndexs, i)
                }
                newData.push(item)
            }
        }
        return newData;
    }, [])

    useEffect(() => {
        innerRef.current.data = resetData(data)
        setInnerData(innerRef.current.data)
    }, [data, resetData])

    const pageEvent = useCallback((pageNo: number, pageSize: number) => {
        const row = { pageNo, pageSize }
        onEvent({ prop: tablePageChangeProp, type: 'change', value: row, row });
        setPage({ ...row })
    }, [onEvent])

    const innerChange = useCallback((data: any) => {
        const nextData = [...innerRef.current.data]
        let currentData: any = nextData
        if (data.$pIndexs) {
            for (let index in data.$pIndexs) {
                if (Array.isArray(currentData)) {
                    currentData = currentData[index as any]
                } else if (Array.isArray(currentData.children)) {
                    currentData = currentData.children[index]
                }
            }
        }
        if (Array.isArray(currentData)) {
            currentData[data.$index] = data
        } else if (Array.isArray(currentData.children)) {
            currentData.children[data.$index] = data
        }

        innerRef.current.data = nextData
        onChange && onChange(innerRef.current.data)
        setInnerData(innerRef.current.data)
    }, [onChange])

    const tableChange = useCallback((p: any, f: any, sorter: any, extra: any) => {
        if (extra.action === 'sort') {
            onEvent({ prop: sorter.field, type: tableSorterType, value: sorter.order, row: sorter })
        }
    }, [innerChange])

    const getColumnDom = useCallback((columns: any, data: any, key: number) => {
        return (
            <Region
                key={key}
                data={data}
                columns={columns}
                onEvent={onEvent}
                onChange={innerChange}
            />
        );
    }, [onEvent, innerChange])

    const selectChange = useCallback((selectedRowKeys: any[], selectedRows: any[]) => {
        setSelecteds(selectedRowKeys)
        onEvent({
            type: 'click',
            prop: tableSelectionProp,
            value: selectedRows,
            row: { selectedRows }
        })
    }, [onEvent])

    const innerConfig = useMemo(() => {
        const defaultConfig: any = {}
        const [DefaultConfigs] = getDefaultConfigs()

        if (config?.selection) {
            defaultConfig.rowSelection = {
                getCheckboxProps(record: any) {
                    const cdisabled = config?.disabled
                    if (cdisabled) {
                        const disabled = typeof cdisabled === 'boolean' ? cdisabled : cdisabled(record)
                        return { disabled }
                    }
                },
                ...defaultConfig.rowSelection,
                selectedRowKeys: selecteds,
                onChange: selectChange
            }
        }

        if (pagination) {
            defaultConfig.pagination = {
                size: 'small',
                showQuickJumper: true,
                showSizeChanger: true,
                showTotal: (total: number) => `共 ${total} 条`,
                current: page.pageNo,
                ...config?.pagination,
                ...pagination,
                onChange: pageEvent
            } 
            if (pagination.pageNo) {
                defaultConfig.pagination.current = pagination.pageNo
            }
        } else if (pagination === false) {
            defaultConfig.pagination = false
        }

        return objectMerge(
            defaultConfig,
            DefaultConfigs.Table,
            config
        )
    }, [config, selecteds, pagination, pageEvent, page.pageNo, selectChange])

    const getColumns = useCallback((column: any, key: number) => {
        if (!hasPermission({ column, value: column.value, data: column.data })) return

        if (column.children) {
            return (
                <ColumnGroup key={key} title={column.label}>
                    {column.children.map((c: any, index: any) => {
                        return getColumns(c, index);
                    })}
                </ColumnGroup>
            );
        } else {
            const tempColumn = {
                ...column,
                config: {
                    align: innerConfig?.align,
                    ...column.config
                }
            }
            const tableColumnConfig = splitConfig(tempColumn.config, tableColumnProps)
            return (
                <Column
                    key={key}
                    title={tempColumn.label}
                    dataIndex={tempColumn.prop}
                    width={tempColumn.width}
                    {...tableColumnConfig}
                    render={(value: any, data: any, index: number) => {
                        if (tempColumn.render) {
                            let render;
                            if (Array.isArray(tempColumn.render)) {
                                render = tempColumn.render;
                            } else if (typeof tempColumn.render === 'function') {
                                render = tempColumn.render({ value, data });
                            }

                            if (Array.isArray(render)) {
                                return getColumnDom(render, data, index);
                            } else {
                                return render;
                            }
                        } else {
                            if (!tempColumn.type) tempColumn.type = 'text';
                            return getColumnDom([tempColumn], data, index);
                        }
                    }}
                />
            );
        }
    }, [getColumnDom, innerConfig?.align])

    const tableColumns = useMemo(() => (
        columns.map((column: any, key: number) => (
            getColumns(column, key)
        ))
    ), [columns, getColumns])



    const _style = useMemo(() => getStyle(keyName, style), [style])
    const _className = useMemo(() => getClass(keyName, className), [className])

    return (
        <Table
            style={_style}
            className={_className}
            dataSource={innerData}
            onChange={tableChange}
            {...innerConfig}
        >
            {tableColumns}
        </Table >
    )
}

FTable[isRenderComponent] = true

export default FTable