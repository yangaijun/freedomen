import React, { useMemo } from "react";
import { Mentions } from "antd";
import { IMentionsProps } from "../../config/type";
import { useClassName, useOptions, useStyle, useChange, useDisabled, useConfig, useItemStyle, useOptionValueLabelName, useRidkeyConfig } from "../../hooks/useBase";
import { names } from "../../config/props";

const ridKeys = [names.labelname, names.valuename]

function FMentions(props: IMentionsProps) {
    const { item } = props

    const style = useStyle(props)
    const onChange = useChange(props)
    const disabled = useDisabled(props)
    const className = useClassName(props)
    const { options } = useOptions(props)
    const itemStyles = useItemStyle(props, options)
    const config = useConfig(props)
    const ridKeysConfig = useRidkeyConfig(config, ridKeys)

    const { labelname, valuename } = useOptionValueLabelName(config)

    return useMemo(() => {
        return <Mentions
            style={style}
            options={options}
            className={className}
            placeholder={item.placeholder}
            disabled={disabled}
            value={item.value}
            onChange={onChange}
            {...ridKeysConfig}
        >
            {options.map((option, index) => (
                <Mentions.Option
                    style={itemStyles[index]}
                    key={option[valuename]}
                    value={option[valuename]}
                    disabled={option.disabled}
                >

                    {option.option || option[labelname]}
                </Mentions.Option>
            ))}
        </Mentions>
    }, [style, item.value, labelname, valuename, item.placeholder, onChange, disabled, itemStyles, className, options, ridKeysConfig])
}

export default FMentions