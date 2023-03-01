import React, { useCallback, useMemo } from "react";
import { TreeSelect } from "antd";
import { getOriginalType } from "../../utils/base";
import { ITreeSelectProps } from "../../config/type";
import { useClassName, useOptions, useStyle, useChange, useDisabled, useConfig } from "../../hooks/useBase";
import MarginLoadingOutlined from "../MarginLoadingOutlined";

const types: any = {
    select: 'treeselect-multiple'
}; 

function FTreeSelect(props: ITreeSelectProps) {
    const { item } = props

    const onChange = useChange(props)
    const style = useStyle(props)
    const disabled = useDisabled(props)
    const className = useClassName(props)
    const { options, loading } = useOptions(props)

    const config = useConfig(props)
    const type = getOriginalType(item)

    const dropdownRender = useCallback((menu: React.ReactNode) => {
        return loading ? <MarginLoadingOutlined /> : menu
    }, [loading])

    return useMemo(() => {
        return <TreeSelect
            style={style}
            value={item.value}
            disabled={disabled}
            className={className}
            onChange={onChange}
            treeData={options}
            placeholder={item.placeholder}
            dropdownRender={dropdownRender}
            treeCheckable={type === types.select}
            fieldNames={{
                key: 'value'
            }}
            {...config}
        />
    }, [style, item.placeholder, dropdownRender, className, disabled, type, item.value, onChange, options, config])

}

export default FTreeSelect