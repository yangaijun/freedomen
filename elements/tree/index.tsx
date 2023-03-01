import { Tree } from "antd";
import { getOriginalType } from "../../utils/base";
import React, { useCallback, useMemo } from "react";
import { ITreeProps } from "../../config/type";
import { useClassName, useOptions, useStyle, useChange, useDisabled, useConfig } from "../../hooks/useBase";
import MarginLoadingOutlined from "../MarginLoadingOutlined";

const types: any = {
    select: 'tree-select'
};

function FTree(props: ITreeProps) {
    const { item } = props

    const onChange = useChange(props)
    const style = useStyle(props)
    const disabled = useDisabled(props)
    const className = useClassName(props)
    const { options, loading } = useOptions(props)

    const type = getOriginalType(item)
    const config = useConfig(props)

    const dropdownRender = useCallback((menu: React.ReactNode) => {
        return loading ? <MarginLoadingOutlined /> : menu
    }, [loading])

    const rst = useMemo(() => {
        if (type === types.select) {
            return {
                checkable: true,
                checkedKeys: item.value,
                onCheck: onChange
            }
        } else {
            return {
                selectedKeys: item.value,
                onSelect: onChange
            }
        }
    }, [type, item.value, onChange])

    return useMemo(() => {
        return <Tree
            style={style}
            className={className}
            fieldNames={{ title: 'label', key: 'value' }}
            dropdownRender={dropdownRender}
            disabled={disabled}
            treeData={options}
            {...rst}
            {...config}
        />
    }, [style, dropdownRender, className, disabled, options, rst, config])


}
export default FTree