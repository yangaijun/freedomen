import React, { useCallback, useMemo, useRef, useState } from 'react';
import Region from '../region';
import { Form } from 'antd';
import { setColumns } from './util';
import { useListComponent } from '../hooks/useBase';
import { hasNameProp, isRenderComponent } from '../config/props';

function FFormList(props: any) {
    const { data, name, columns = [], onEvent, onChange } = props
    const [innerData, setInnerData] = useState<any[]>([])
    const innerRef = useRef<any>({ data: null })

    const { innerEvent } = useListComponent(innerRef, setInnerData, onChange, onEvent, data)

    const innerChange = useCallback((data: any) => {
        const nextData = [...innerRef.current.data]
        nextData[data.$index] = data
        innerRef.current.data = nextData

        onChange && onChange(innerRef.current.data, name)
        setInnerData(innerRef.current.data)
    }, [name, onChange])

    const formColumns = useMemo(() => {
        return innerData.map((data: any) => (
            <Region
                data={data}
                key={data.$key}
                onEvent={innerEvent}
                onChange={innerChange}
                columns={setColumns(data, columns)}
            />
        ))
    }, [innerData, innerEvent, innerChange, columns])

    return <Form.List name={name}>
        {() => formColumns}
    </Form.List>
}

FFormList[isRenderComponent] = true

FFormList[hasNameProp] = true
 
export default FFormList