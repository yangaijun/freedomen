import React, { useRef, useState } from "react";
import { IListProps } from "../config/type";
import { useListComponent } from "../hooks/useBase";
import { isRenderComponent } from "../config/props";
import Region from "../region";

function FList(props: IListProps) {
    const { columns, onEvent, data, style, className, onChange } = props
    const [innerData, setInnerData] = useState<any[]>([])
    const innerRef = useRef<any>({ data: null })

    const { innerEvent } = useListComponent(innerRef, setInnerData, onChange, onEvent, data)

    return (
        <div style={style} className={className}>
            {innerData?.map((data) => {
                return (
                    <Region
                        data={data}
                        key={data.$key}
                        columns={columns}
                        onEvent={innerEvent}
                    />
                )
            })}
        </div>
    )
}

FList[isRenderComponent] = true

export default FList