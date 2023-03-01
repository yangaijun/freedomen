import React, { useMemo } from "react";
import { Tag } from "antd";
import { ITagProps } from "../../config/type";
import { useClassName, useStyle, useFilter, useConfig } from "../../hooks/useBase";
 
function FTag(props: ITagProps) {

    const style = useStyle(props)
    const className = useClassName(props)
    const filter = useFilter(props)

    const config = useConfig(props)
    
    return useMemo(() => {
        return <Tag
            className={className}
            style={style}
            {...config}
        >
            {filter}
        </Tag>
    }, [className, style, config, filter])

}

export default FTag