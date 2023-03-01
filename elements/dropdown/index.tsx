import React, { useMemo } from "react";
import { Button, Dropdown, Menu } from "antd";
import { getOriginalType } from "../../utils/base";
import { names } from "../../config/props";
import { useStyle, useClassName, useDisabled, useEvent, useOptions, useConfig, useRidkeyConfig, useItemStyle, useOptionValueLabelName } from "../../hooks/useBase";
import { DownOutlined } from "@ant-design/icons";
import { IDropdownProps } from "../../config/type";
import MarginLoadingOutlined from "../MarginLoadingOutlined";

const ridKeys = ['content', names.labelname, names.valuename]
const types: any = {
    'dropdown': 1,
    'dropdown-a': 2,
    'dropdown-primary': 3
}

const DEFAULT_TEXT = "请选择"

function FDropdown(props: IDropdownProps) {
    const { item } = props
    const onEvent = useEvent(props)
    const style = useStyle(props)
    const className = useClassName(props)
    const disabled = useDisabled(props)
    const { options, loading } = useOptions(props)

    const itemStyles = useItemStyle(props, options)

    const config = useConfig(props)
    const ridKeysConfig = useRidkeyConfig(config, ridKeys)

    const { labelname, valuename } = useOptionValueLabelName(config)

    let type = getOriginalType(item)
    const dType = types[type]

    const menu = useMemo(() => {
        if (loading) {
            return <Menu>
                <Menu.Item >
                    <MarginLoadingOutlined />
                </Menu.Item>
            </Menu>
        }
        return <Menu onClick={({ key }: { key: any }) => {
            onEvent('click', options[key][valuename]);
        }}>
            {options.map((option, index) => {
                return (
                    <Menu.Item
                        key={index}
                        disabled={option.disabled}
                        style={itemStyles[index]}
                    >
                        {option[labelname]}
                    </Menu.Item>
                );
            })}
        </Menu>
    }, [options, itemStyles, loading, labelname, valuename, onEvent])

    const children = useMemo(() => {
        const itemText = <span>{item.text || DEFAULT_TEXT} <DownOutlined /></span>
        const { content, size } = config
        if (content) return content

        if (dType === types['dropdown-a']) {
            return <a onClick={e => e.preventDefault()} > {itemText} </a>
        } else if (dType === types['dropdown-primary']) {
            return <Button size={size} type="primary">
                {itemText}
            </Button>
        } else {
            return <Button size={size} >
                {itemText}
            </Button>
        }
    }, [dType, item.text, config])

    return useMemo(() => {
        return <Dropdown
            overlay={menu}
            style={style}
            className={className}
            disabled={disabled}
            {...ridKeysConfig} >
            {children}
        </Dropdown>
    }, [menu, style, className, disabled, ridKeysConfig, children])
}

export default FDropdown