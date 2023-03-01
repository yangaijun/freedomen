import React, { useMemo } from "react";
import { Input } from "antd";
import { useStyle, useClassName, useConfig, useChildren } from "../../hooks/useBase";

export interface inputGroupProps {
    children: React.ReactElement,
    item: any
}

export default function FInputGroup(props: inputGroupProps) { 

    const style = useStyle(props)
    const className = useClassName(props)
    const config = useConfig(props)
    const children = useChildren(props)

    return useMemo(() => {
        return <Input.Group
            className={className} style={style}
            compact {...config} >
            {children}
        </Input.Group>
    }, [style, className, config, children])

}