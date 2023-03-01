import React, { useCallback, useMemo } from "react";
import { useClassName, useOptions, useStyle, useChange, useDisabled, useConfig } from "../../hooks/useBase";
import { Cascader } from "antd";
import { ICascaderProps } from "../../config/type";
import MarginLoadingOutlined from "../MarginLoadingOutlined";

function FCascader(props: ICascaderProps) {
    const { item } = props

    const style = useStyle(props)
    const onChange = useChange(props)
    const disabled = useDisabled(props)
    const className = useClassName(props)
    const { options, loading } = useOptions(props)
    const config = useConfig(props)

    const dropdownRender = useCallback((menu: React.ReactNode) => {
        return loading ? <MarginLoadingOutlined/> : menu
    }, [loading])

    return useMemo(() => {
        return <Cascader
            style={style}
            className={className}
            options={options}
            disabled={disabled}
            value={item.value}
            onChange={onChange}
            placeholder={item.placeholder}
            dropdownRender={dropdownRender}
            {...config}
        />
    }, [style, item.value, item.placeholder, onChange, disabled, className, options, config, dropdownRender])
}

export default FCascader