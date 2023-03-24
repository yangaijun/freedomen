import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getClass, getConfig, getOptionStyle, getStyle } from "../utils/base";
import { defaultFilterVoidText, deleteProp, filterDefaultKey, names, pushProp } from "../config/props";
import util, { getChainValueByString } from "../utils/util";

export function useChange(props: any): (value: any) => void {
    const { onChange, item } = props

    return (value) => {
        if (onChange && util.notEquals(getChainValueByString(item.$data, item.prop), value)) {
            onChange({
                prop: item.prop,
                value: value,
                column: item
            })
        }
    }
}

export function useEvent(props: any): (type: string, value: any) => void {
    const { onEvent, item, item: { prop } } = props
    const ref = useRef({ item: { ...item } })

    return useMemo(() => {
        return (type, value) => {
            onEvent && onEvent({
                prop,
                type,
                value,
                column: ref.current.item
            })
        }
    }, [prop, onEvent])
}

export function useDisabled(props: any): boolean | undefined {
    const { item: { disabled, $data: data, $preData: preData, value } } = props

    const makeDisabled = useCallback(() => {
        let next = disabled
        if (typeof disabled === 'function') {
            next = disabled({ value, data, preData });
        }
        return next
    }, [disabled, value, data, preData])

    const [innerDisabled, setInnerDisabled] = useState<boolean>(() => makeDisabled())

    useEffect(() => {
        let next = makeDisabled()

        if (util.notEquals(innerDisabled, next)) {
            setInnerDisabled(next)
        }
    }, [makeDisabled, innerDisabled])

    return innerDisabled
}

export function useClassName(props: any): string | undefined {
    const { item: { type, className, $data: data, $preData: preData, value } } = props

    const makeClassName = useCallback(() => {
        let next = className
        if (typeof className === 'function')
            next = className({ value, data, preData });
        else if (!className) {
            next = getClass({ type, data, value })
        }
        return next
    }, [type, className, value, data, preData])

    const [innerClassName, setInnerClassName] = useState<string>(() => makeClassName())

    useEffect(() => {
        let next = makeClassName()
        if (util.notEquals(innerClassName, next)) {
            setInnerClassName(next)
        }
    }, [makeClassName, innerClassName])

    return innerClassName
}

export function useStyle(props: any): React.CSSProperties {
    const { item: { type, style, $data: data, $preData: preData, value } } = props

    const makeStyle = useCallback(() => {
        let next = getStyle({ type, value, data })
        if (typeof style === 'function') {
            next = {
                ...next,
                ...style({ value, data, preData })
            }
        } else {
            next = {
                ...next,
                ...style
            }
        }
        return next
    }, [type, style, value, data, preData])

    const [innerStyle, setInnerStyle] = useState<React.CSSProperties>(() => makeStyle())

    useEffect(() => {
        let next = makeStyle()
        if (util.notEquals(innerStyle, next)) {
            setInnerStyle(next)
        }
    }, [makeStyle, innerStyle])

    return innerStyle as React.CSSProperties
}

export function useItemStyle(props: any, options: any[]): React.CSSProperties[] {
    const { item } = props

    const makeStyles = useCallback(() => {
        return options.map(option => {
            return getOptionStyle(option, item)
        })
    }, [options, item])

    const [innerStyles, setInnerStyles] = useState<React.CSSProperties[]>(() => makeStyles())

    useEffect(() => {
        let next = makeStyles()
        if (util.notEquals(innerStyles, next)) {
            setInnerStyles(next)
        }
    }, [makeStyles, innerStyles])

    return innerStyles as React.CSSProperties[]
}

export function useFilter(props: any): string | undefined {
    const { item: { filter, $data: data, $preData: preData, value } } = props

    const makeFilter = useCallback(() => {
        let next = value
        if (typeof filter === 'function') {
            next = filter({ value, data, preData });
        } else if (util.isPlainObject(filter)) {
            next = filter[value] || filter[filterDefaultKey];
        } else if (typeof filter === 'string') {
            if (value === void 0) next = defaultFilterVoidText;

            let date = new Date(value);
            if (date.toString() !== 'Invalid Date') {
                next = util.dateFormat(filter, date);
            }
        }
        return next
    }, [filter, value, data, preData])

    const [innerFilter, setInnerFilter] = useState(() => makeFilter())

    useEffect(() => {
        let next = makeFilter()
        if (util.notEquals(innerFilter, next)) {
            setInnerFilter(next)
        }
    }, [makeFilter, innerFilter])

    return innerFilter
}

export function useChildren(props: any) {
    return props.children
}

export function useConfig(props: any): any {
    const { item } = props
    const onEvent = useEvent(props)
    const makeConfig = useCallback(() => {
        return getConfig(item, onEvent)
    }, [item, onEvent])

    const [innerConfig, setInnerConfig] = useState(() => makeConfig())

    useEffect(() => {
        let next = makeConfig()
        if (util.notEquals(innerConfig, next)) {
            setInnerConfig(next)
        }
    }, [makeConfig, innerConfig])

    return innerConfig
}

export function useRidkeyConfig(config: any, ridKeys: any[] = []): any {
    const makeRidkeyConfig = useCallback(() => {
        let next = { ...config }
        ridKeys.forEach(key => {
            delete next[key];
        });
        return next
    }, [config, ridKeys])

    const [innerRidkeyConfig, setInnerRidkeyConfig] = useState(() => makeRidkeyConfig())

    useEffect(() => {
        let next = makeRidkeyConfig()
        if (util.notEquals(innerRidkeyConfig, next)) {
            setInnerRidkeyConfig(next)
        }
    }, [makeRidkeyConfig, innerRidkeyConfig])

    return innerRidkeyConfig
}

export function useOptions(props: any, innerValue?: any): { options: any[], loading: boolean } {
    const { item: { prop, options, $data: data, value, $preData: preData } } = props
    const [innerOptions, setInnerOptions] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const useUpdateRef = useRef<any>({
        isDestory: false,
        shouldUpdate: null,
        shouldLoad: undefined
    })

    useEffect(() => {
        const resetOptions = (next: any[]) => {
            if (util.notEquals(innerOptions, next)) {
                setInnerOptions(next)
            }
        }

        if (typeof options !== 'function') {
            setLoading(false)
            resetOptions(util.resetOptions(options))
        } else {
            const shouldUpdate = (callback: (preData: any, currentData: any) => boolean) => {
                useUpdateRef.current.shouldUpdate = callback
            }
            const calcNeedUpdate = () => {
                const { shouldUpdate } = useUpdateRef.current

                if (innerValue !== undefined && shouldUpdate === null) {
                    return true
                } else if (shouldUpdate !== null) {
                    return typeof shouldUpdate === 'boolean' ? shouldUpdate : shouldUpdate(preData, data)
                } else {
                    return false
                }
            }
            //undifined 也是一种
            if (useUpdateRef.current.shouldLoad !== false || calcNeedUpdate()) {
                if (useUpdateRef.current.shouldLoad === undefined) {
                    useUpdateRef.current.shouldLoad = false
                }
                useUpdateRef.current.isDestory = false

                const promise = new Promise((resolve) => {
                    setLoading(true)
                    let nextValue = innerValue !== undefined ? innerValue : value
                    options({ resolve, data, value: nextValue, preData, shouldUpdate });
                });

                promise.then((options: any) => {
                    if (!useUpdateRef.current.isDestory) {
                        setLoading(false)
                        resetOptions(util.resetOptions(options))
                    }
                })
            }
        }
    }, [prop, innerOptions, value, preData, data, options, innerValue])

    useEffect(() => {
        return () => {
            useUpdateRef.current.isDestory = true
        }
    }, [])

    return {
        options: innerOptions,
        loading
    }
}

export function useOptionValueLabelName(config: any): { labelname: string, valuename: string } {
    const { labelname, valuename } = config

    return useMemo(() => {
        return {
            labelname: labelname || names.labelname,
            valuename: valuename || names.valuename
        }
    }, [labelname, valuename])
}

function notNull(value: any) {
    return value !== undefined && value !== null
}

export function useOptionIOValue(config: any, options: any[], value: any): { innerValue: any, outerValue: Function } {
    const { valuename } = useOptionValueLabelName(config)
    const optionvalue = config[names.optionvalue]

    return useMemo(() => {
        if (optionvalue) {
            let innerValue = value
            const outerValue = (next: any) => {
                if (Array.isArray(next)) {
                    return options.filter(option => {
                        return next.includes(option[valuename])
                    })
                } else if (notNull(next)) {
                    return options.find(option => {
                        return option[valuename] === next;
                    });
                }
                return next
            }
            if (Array.isArray(value)) {
                innerValue = value.map(el => {
                    return util.isPlainObject(el) ? el[valuename] : el
                })
            } else if (notNull(value)) {
                innerValue = (util.isPlainObject(value) ? value[valuename] : value)
            }
            return {
                innerValue, outerValue
            }
        } else {
            return {
                innerValue: value,
                outerValue: (next: any) => next
            }
        }
    }, [value, valuename, optionvalue, options])
}

export function useListComponent(innerRef: any, setInnerData: Function, onChange?: Function, onEvent?: Function, data?: any[]) {
    useEffect(() => {
        const nextData: any[] = []
        if (data) {
            data.forEach((el: any, index: number) => {
                const item = {
                    $key: util.getUUID(),
                    ...el,
                    $index: index,
                }
                nextData.push(item)
            })
        }
        innerRef.current.data = nextData
        setInnerData(innerRef.current.data)
    }, [data])

    const innerEvent = useCallback((params: any) => {
        if (params.prop === deleteProp || params.prop === pushProp) {
            const { data } = innerRef.current
            const nextData = [...data]

            if (params.prop === deleteProp) {
                nextData.splice(params.row.$index, 1)
                nextData.forEach((el: any, index: number) => {
                    el.$index = index
                })
                innerRef.current.data = nextData
            } else if (params.prop === pushProp) {
                nextData.push({
                    $index: nextData.length,
                    $key: util.getUUID()
                })
                innerRef.current.data = nextData
            }

            onChange && onChange(innerRef.current.data)
            setInnerData(innerRef.current.data)
        } else {
            return onEvent && onEvent(params)
        }
    }, [onEvent])

    return { innerEvent }
}