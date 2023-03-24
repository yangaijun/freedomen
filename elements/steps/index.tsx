import React, { useMemo } from "react"
import { Steps } from "antd";
import { IStpesProps } from "../../config/type";
import { getOriginalType } from "../../utils/base";
import { useChange, useClassName, useConfig, useDisabled, useOptions, useOptionValueLabelName, useRidkeyConfig, useStyle } from "../../hooks/useBase"
import MarginLoadingOutlined from "../MarginLoadingOutlined";
import { names } from "../../config/props";

const ridKeys = [names.labelname, names.valuename]
const { Step } = Steps;

const types: any = {
    'steps': 'horizontal',
    'steps-vertical': 'vertical'
}

export default function FSteps(props: IStpesProps) {
    const { item } = props

    const style = useStyle(props)
    const onChange = useChange(props)
    const disabled = useDisabled(props)
    const className = useClassName(props)
    const { options, loading } = useOptions(props)

    const config = useConfig(props)
    const ridKeysConfig = useRidkeyConfig(config, ridKeys)
    const type = types[getOriginalType(item)] || types.steps

    const { labelname, valuename } = useOptionValueLabelName(config)

    return useMemo(() => {
        const index = options.findIndex(option => {
            return option[valuename] === item.value
        })
        const current = index === -1 ? 0 : index

        return loading ? <MarginLoadingOutlined /> :
            <Steps
                current={current}
                className={className}
                direction={type}
                style={style}
                onChange={(c) => {
                    onChange(options[c][valuename])
                }}
                {...ridKeysConfig}
            >
                {
                    options.map((option) => (
                        <Step
                            disabled={disabled}
                            {...option}
                            key={option[valuename]}
                            title={option[labelname]}
                        />
                    ))
                }
            </Steps>
    }, [style, item.value, valuename, type, labelname, onChange, disabled, className, options, loading, ridKeysConfig])
}