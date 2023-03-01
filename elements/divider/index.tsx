import React from 'react';
import { Divider } from "antd";
import { useClassName, useStyle, useFilter, useConfig } from "../../hooks/useBase";
import { useMemo } from "react";
import { IDividerProps } from "../../config/type";

function FDivider(props: IDividerProps) {
    const style = useStyle(props)
    const className = useClassName(props)
    const filter = useFilter(props)
    const config = useConfig(props)

    return useMemo(() => <Divider
        style={style}
        className={className}
        {...config}
    >
        {filter}
    </Divider>, [style, className, filter, config])

}

export default FDivider