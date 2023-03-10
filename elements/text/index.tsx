import React from "react";
import { Tooltip } from "antd";
import { getOriginalType } from "../../utils/base";
import { useEffect, useMemo, useState } from "react";
import { getSubString } from "../../utils/util";
import { ITextProps } from "../../config/type";
import { useClassName, useStyle, useFilter, useEvent, useConfig, useRidkeyConfig } from "../../hooks/useBase";

const defaultDomName = 'span'
const ridKeys = ['tooltip', 'maxlength'];

function FText(props: ITextProps) {
    const { item } = props

    const [subText, setSubText] = useState<string>('')
    const onEvent = useEvent(props)
    const style = useStyle(props)
    const className = useClassName(props)
    const filter = useFilter(props)

    const config = useConfig(props)
    const ridKeysConfig = useRidkeyConfig(config, ridKeys)
    const type = getOriginalType(item)

    const { maxlength, tooltip } = config

    const domName = useMemo(() => {
        const tempType = type.split('-')
        if (tempType.length >= 2) return tempType[1]
        return defaultDomName
    }, [type])

    useEffect(() => {
        if (maxlength && filter?.length && maxlength < filter?.length) {
            setSubText(getSubString(filter, maxlength))
        }
    }, [filter, maxlength])

    return useMemo(() => {
        const Element = React.createElement(
            domName,
            {
                style,
                className,
                onClick: () => {
                    onEvent('click', item.value)
                },
                ...ridKeysConfig
            },
            subText || filter
        );

        if (subText && tooltip !== false) {
            return <Tooltip title={filter}>
                {Element}
            </Tooltip>
        } else {
            return Element
        }

    }, [domName, style, item.value, className, onEvent, subText, filter, tooltip, ridKeysConfig])
}

export default FText

