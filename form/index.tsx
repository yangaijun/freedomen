import React, { useCallback, useEffect, forwardRef, useImperativeHandle, useState, useMemo, useRef } from 'react';
import { Form } from 'antd'
import Region from '../region'
import { getClass, getStyle, objectMerge, resetToOtherObject } from '../utils/util';
import { setColumns } from './util';
import { isRenderComponent, resetProp, submitEventType, submitProp } from '../config/props';
import { getDefaultConfigs } from '../config/config';
import { IFormProps } from '../config/type';

const keyName = 'Form'

function getSubmitItem(innerColumns: any[]): any {
    for (let item of innerColumns) {
        if (Array.isArray(item)) {
            const result = getSubmitItem(item)
            if (result) {
                return result
            }
        } else if (item.prop?.indexOf(submitProp) === 0) {
            return item
        }
    }
    return null
}

function isLoadingSubmit(columnItem: any) {
    if (columnItem === null) {
        return false
    } else {
        return columnItem.config?.loading === true
    }
}

function isOnSubmit(params: any, columnItem: any) {
    return params.prop?.indexOf(submitProp) === 0
        || (params.column.config?.[submitEventType] === params.type && !isLoadingSubmit(columnItem))
}

export interface FFormRef {
    submit: () => void;
    reset: () => void;
    set: (prop: string, callback: Function | any) => void,
    get: (prop?: string) => any,
}

const FForm: React.ForwardRefRenderFunction<FFormRef, IFormProps> = (props, ref) => {
    const { className, style, data, columns, onSubmit, onEvent, onChange, config } = props

    const [validateField, setValidateField] = useState<string[] | null>(null)
    const [submitParams, setSubmitParams] = useState<any>()
    const innerRef = useRef({ data: {}, submitColumn: null })
    const [form] = Form.useForm()
    const region = useRef<any>()

    const innerColumns = useMemo(() => {
        const nextColumns = setColumns(innerRef.current.data, columns)
        innerRef.current.submitColumn = getSubmitItem(nextColumns)

        return nextColumns
    }, [columns])

    const submit = useCallback(() => {
        form.submit()
    }, [form])

    const reset = useCallback(() => {
        region.current.reset(null)
        form.resetFields()
    }, [form])

    useImperativeHandle(ref, () => {
        return {
            submit,
            reset,
            set: region.current.set,
            get: region.current.get
        }
    })

    useEffect(() => {
        resetToOtherObject(innerRef.current.data, data)
    }, [data])

    useEffect(() => {
        if (validateField) {
            form.validateFields(validateField)
        }
    }, [form, validateField])

    const innerEvent = useCallback((params: any) => {
        if (params.type === 'change' && params.prop) {
            setValidateField([params.prop])
        } else if (isOnSubmit(params, innerRef.current.submitColumn)) {
            setSubmitParams(params)
            submit()
        } else if (params.prop?.includes(resetProp)) {
            //resetProp region 已经重置过数据了
            form.resetFields()
        }

        return onEvent && onEvent(params)
    }, [form, submit, onEvent])

    const innerChange = useCallback((data: any) => {
        resetToOtherObject(innerRef.current.data, data)
        onChange && onChange(data)
    }, [onChange])

    const onFinish = useCallback(() => {
        const back = onSubmit && onSubmit(innerRef.current.data, submitParams);
        if (back === null) {
            reset()
        }
    }, [onSubmit, reset, submitParams])

    const defalutLabelCol = useMemo(() => {
        if (!config?.layout) {
            return { span: 4 }
        }
    }, [config?.layout])

    const innerConfig = useMemo(() => {
        const [DefaultConfigs] = getDefaultConfigs()

        return objectMerge(
            {},
            DefaultConfigs.Form,
            config
        )
    }, [config])

    const _style = useMemo(() => getStyle(keyName, style), [style])
    const _className = useMemo(() => getClass(keyName, className), [className])

    return <Form
        form={form}
        onFinish={onFinish}
        labelCol={defalutLabelCol}
        className={_className}
        style={_style}
        {...innerConfig}
        validateTrigger="none"
    >
        <Region
            data={data}
            ref={region}
            columns={innerColumns}
            onEvent={innerEvent}
            onChange={innerChange}
        />
    </Form>
}

const F = forwardRef(FForm) as (
    props: React.PropsWithChildren<IFormProps> & { ref?: React.Ref<FFormRef> }
) => React.ReactElement;

type InnerFType = typeof F

interface InnerRInterface extends InnerFType {
    [isRenderComponent]?: boolean
}

const InnerF = F as InnerRInterface

InnerF[isRenderComponent] = true

export default InnerF
