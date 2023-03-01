import React from 'react';
import Form from '../form'
import { IFormProps } from '../config/type'
import { isRenderComponent } from '../config/props';

function Search(props: IFormProps) {
    return <Form config={{ layout: 'inline', labelCol: undefined }} {...props} /> 
}

Search[isRenderComponent] = true

export default Search