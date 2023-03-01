import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClassName, useOptions, useStyle, useChange, useDisabled, useConfig } from "../../hooks/useBase";
import { AutoComplete } from "antd";
import { IAutoCompleteProps } from "../../config/type";
import MarginLoadingOutlined from "../MarginLoadingOutlined";

function FAutoComplete(props: IAutoCompleteProps) {
    const { item } = props

    const [value, setValue] = useState<string>()
    const innerRef = useRef<any>({ value: null })

    const style = useStyle(props)
    const onChange = useChange(props)
    const disabled = useDisabled(props)
    const className = useClassName(props)
    const { options, loading } = useOptions(props, true)
    const config = useConfig(props)

    const dropdownRender = useCallback((menu: React.ReactNode) => {
        return loading ? <MarginLoadingOutlined /> : menu
    }, [loading])

    useEffect(() => {
        if (innerRef.current.value !== item.value) {
            setValue(item.value)
        }
    }, [item.value])

    return useMemo(() => {
        return <AutoComplete
            value={value}
            style={style}
            options={options}
            className={className}
            dropdownRender={dropdownRender}
            placeholder={item.placeholder}
            disabled={disabled}
            onChange={value => {
                innerRef.current.value = value

                setValue(value)
                onChange(value)
            }}
            {...config}
        />
    }, [style, value, item.placeholder, disabled, onChange, className, options, dropdownRender, config])
}

export default FAutoComplete