import React, { useCallback, useEffect, useImperativeHandle, forwardRef, useMemo, useRef, useState } from 'react';
import Render, { renderType, renderContainerType, customRenders } from '../render'
import { IRegionColumnItemProps, IRegionProps } from '../config/type';
import { CONTAINER_NAMES, getContainerDom } from '../containers';
import { customTypeProp, isRenderComponent, resetProp } from '../config/props';
import util, { getChainValueByString, getClass, getStyle, isUndefined, resetToOtherObject, setChainValueByString } from '../utils/util';
import { hasPermission } from '../config/permission';
import { getElementDom } from '../elements';
import { getFullType } from '../utils/base';

const keyName = 'Region'

function getLastColumn(columns: IRegionColumnItemProps[]) {
    return columns[columns.length - 1];
}

function isResetProp(prop = '') {
    return prop.indexOf(resetProp) === 0
}

function isResetData(data: any) {
    return data === null || (util.isPlainObject(data) && Object.keys(data).length === 0)
}

function getType(column: IRegionColumnItemProps): string {
    let columnType = getFullType(column)
    if (columnType.includes('@')) {
        columnType = columnType.split('@')[0];
    }

    return columnType.split('-')[0]
}

export function isContainer(column: IRegionColumnItemProps = {}) {
    const regionType = getFullType(column)
    return regionType.indexOf(renderContainerType) === 0 || CONTAINER_NAMES.includes(getType(column));
}

function getResetColumn(column: IRegionColumnItemProps, data: Record<any, any>, preData: Record<any, any>) {
    const newColumn = { ...column }

    newColumn.value = isUndefined(data, newColumn.prop as string) ? newColumn.value : getChainValueByString(data, newColumn.prop as string);
    newColumn.$data = data;
    newColumn.$preData = preData;

    const type = getType(newColumn)
    //use register render
    if (type && customRenders[type]) {
        newColumn.render = customRenders[type].render
        newColumn[customTypeProp] = newColumn.type
        //delete type key
        newColumn.type = customRenders[type].isContainer ? renderContainerType : renderType
    }

    return newColumn
}

function getResetColumns(columns: IRegionColumnItemProps[], data: Record<any, any>, preData: Record<any, any>): IRegionColumnItemProps[] {
    let newColumns = []
    for (let i = 0; i < columns.length; i++) {
        let column = columns[i];

        if (Array.isArray(column)) {
            newColumns.push(getResetColumns(column as IRegionColumnItemProps[], data, preData))
        } else {
            newColumns.push(getResetColumn(column, data, preData))
        }
    }
    return newColumns;
}

const cloneData = (data = {}) => {
    return util.clone(data)
}

const legalData = (data = {}) => {
    return { ...data }
}

export interface FRegionRef {
    reset: (params?: any) => void,
    set: (prop: string, callback: Function | any) => void,
    get: (prop?: string) => any
}

const FRegion: React.ForwardRefRenderFunction<FRegionRef, IRegionProps> = (props: IRegionProps, ref: any) => {
    const { data: propData, columns, className, style, onEvent, onChange } = props
    const data = legalData(propData)

    const innerRef = useRef<{ preData: any, data: any }>({ preData: cloneData(data), data })
    const [initialData] = useState(() => cloneData(data))
    const [innerData, setInnerData] = useState(data)
    const [eventParams, setEventParams] = useState()

    const changeInnerData = useCallback((nextData: any, params?: any) => {
        resetToOtherObject(innerRef.current.preData, innerRef.current.data)
        resetToOtherObject(innerRef.current.data, nextData)

        setInnerData(nextData)
        setEventParams(params) 
        //reset null  params 空不可以onChange
        if (params !== null) {
            onChange && onChange(nextData)
        }
    }, [onChange])

    const setItemValue = useCallback((prop: string, callback: Function | any) => {
        const nextData = util.clone(innerRef.current.data)
        let value = callback

        if (typeof callback === 'function') {
            value = callback(getChainValueByString(nextData, prop))
        } 
        setChainValueByString(nextData, prop, value)
        changeInnerData(nextData)
    }, [])

    const getItemValue = useCallback((prop?: string) => {
        if (!prop) {
            return innerRef.current.data
        }
        return getChainValueByString(innerRef.current.data, prop)
    }, [])

    const reset = useCallback((params?: any) => {
        if (params) {
            params.row = util.clone(initialData);
        }
        changeInnerData(util.clone(initialData), params)

    }, [initialData, changeInnerData])

    const handlerEvent = useCallback((params: any) => {
        const newData = onEvent && onEvent(params);

        if (newData instanceof Promise) {
            newData.then(changeInnerData)
        } else if (newData) {
            changeInnerData(newData)
        } else if (isResetData(newData)) {
            reset(null)
        }
    }, [onEvent, changeInnerData, reset])

    const innerEvent = useCallback((params: any) => {
        if (isResetProp(params.prop)) {
            reset(params);
        } else {
            params.row = util.clone(innerRef.current.data);
            //reset中会回调到外部事件，不要放到下面
            handlerEvent(params)
        }

    }, [reset, handlerEvent])

    const innerChange = useCallback((params: Record<string, any>) => {
        if (params.prop) {
            const nextData = util.clone(innerRef.current.data)
            setChainValueByString(nextData, params.prop, params.value)

            const nextParams = {
                type: 'change',
                ...params,
                row: util.clone(nextData)
            }
            changeInnerData(nextData, nextParams)
        }
    }, [changeInnerData])

    useImperativeHandle(ref, () => {
        return {
            reset,
            set: setItemValue,
            get: getItemValue
        }
    })

    useEffect(() => {
        const nextData = legalData(propData)
        
        resetToOtherObject(innerRef.current.preData, innerRef.current.data)
        resetToOtherObject(innerRef.current.data, nextData)
        setInnerData(nextData)
    }, [propData])

    useEffect(() => {
        if (eventParams) {
            handlerEvent(eventParams)
            setEventParams(undefined)
        }
    }, [eventParams, handlerEvent])

    const getContainer = useCallback((column: IRegionColumnItemProps, children: IRegionColumnItemProps[], key: number) => {
        const type = getType(column);
        const Container = type === renderType ? Render : getContainerDom(type)

        return <Container
            key={key}
            onChange={innerChange}
            onEvent={innerEvent}
            children={children}
            item={column}
        />;
    }, [innerChange, innerEvent])

    const getElement = useCallback((column: IRegionColumnItemProps, key: number) => {
        const type = getType(column);
        const Element = type === renderType ? Render : getElementDom(type);

        if (!Element) {
            console.error('未发现的元素类型：=>', type)
            return null;
        }

        return <Element
            key={key}
            onEvent={innerEvent}
            onChange={innerChange}
            item={column}
        />;
    }, [innerEvent, innerChange])

    const isLoad = useCallback((column: IRegionColumnItemProps) => {
        const { data, preData } = innerRef.current
        const params = { column, data, preData, value: column.value }

        if (typeof column.load === 'function') {
            return column.load(params) && hasPermission(params);
        }
        return hasPermission(params);
    }, [])

    const makeJsx: any = useCallback((columns: IRegionColumnItemProps[], level = 0) => {
        if (!columns.length) return;

        let container = [], children = [];
        let lastColumn = getLastColumn(columns);

        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];

            if (isContainer(lastColumn) && !isLoad(lastColumn)) break;

            if (isContainer(column)) {
                container.push(getContainer(column, children, i + level));
                children = [];
            } else if (Array.isArray(column)) {
                children.push(makeJsx(column, ++level));
            } else if (!isLoad(column)) {
                continue;
            } else {
                children.push(getElement(column, i + level));
            }
        }

        if (!isContainer(lastColumn)) {
            container.push(children);
        }

        return container;
    }, [isLoad, getContainer, getElement])

    const _style = useMemo(() => getStyle(keyName, style), [style])
    const _className = useMemo(() => getClass(keyName, className), [className])

    const render = useMemo(() => {
        return makeJsx(getResetColumns(columns, innerData, innerRef.current.preData))
    }, [columns, innerData, makeJsx])

    if ((_style && Object.keys(_style).length) || _className) {
        return <div style={style} className={_className}>
            {render}
        </div>
    } else {
        return <React.Fragment>
            {render}
        </React.Fragment>;
    }
}

const R = forwardRef(FRegion) as (
    props: React.PropsWithChildren<IRegionProps> & { ref?: React.Ref<FRegionRef> },
) => React.ReactElement;

type InnerRType = typeof R

interface InnerRInterface extends InnerRType {
    [isRenderComponent]?: boolean
}

const InnerR = R as InnerRInterface

InnerR[isRenderComponent] = true

export default InnerR
