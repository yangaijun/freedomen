"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var antd_1 = require("antd");
var region_1 = __importDefault(require("../region"));
var permission_1 = require("../config/permission");
var useBase_1 = require("../hooks/useBase");
var util_1 = require("../utils/util");
var config_1 = require("../config/config");
var props_1 = require("../config/props");
var Column = antd_1.Table.Column, ColumnGroup = antd_1.Table.ColumnGroup;
var keyName = 'Table';
function FTable(props) {
    var style = props.style, className = props.className, columns = props.columns, data = props.data, pagination = props.pagination, onEvent = props.onEvent, onChange = props.onChange, config = props.config;
    var _a = (0, react_1.useState)([]), selecteds = _a[0], setSelecteds = _a[1];
    var _b = (0, react_1.useState)(props_1.defaultPage), page = _b[0], setPage = _b[1];
    var _c = (0, useBase_1.useListComponent)(onChange, onEvent, data), innerData = _c.innerData, innerChange = _c.innerChange, innerEvent = _c.innerEvent;
    var pageEvent = (0, react_1.useCallback)(function (pageNo, pageSize) {
        var row = { pageNo: pageNo, pageSize: pageSize };
        setPage(__assign({}, row));
        onEvent && onEvent({ prop: props_1.tablePageChangeProp, type: props_1.changeType, value: row, row: row });
    }, [onEvent]);
    var tableChange = (0, react_1.useCallback)(function (p, f, sorter, extra) {
        if (extra.action === 'sort') {
            onEvent && onEvent({ prop: sorter.field, type: props_1.tableSorterType, value: sorter.order, row: sorter });
        }
    }, [innerChange]);
    var getColumnDom = (0, react_1.useCallback)(function (columns, data, key) {
        return (react_1.default.createElement(region_1.default, { key: key, data: data, columns: columns, onEvent: innerEvent, onChange: innerChange }));
    }, [onEvent, innerEvent, innerChange]);
    var selectChange = (0, react_1.useCallback)(function (selectedRowKeys, selectedRows) {
        setSelecteds(selectedRowKeys);
        onEvent && onEvent({
            type: props_1.clickType,
            prop: props_1.tableSelectionProp,
            value: selectedRows,
            row: { selectedRows: selectedRows }
        });
    }, [onEvent]);
    var innerConfig = (0, react_1.useMemo)(function () {
        var defaultConfig = {};
        var DefaultConfigs = (0, config_1.getDefaultConfigs)()[0];
        var paginationConfig = {};
        if (config === null || config === void 0 ? void 0 : config.selection) {
            defaultConfig.rowSelection = __assign(__assign({ getCheckboxProps: function (record) {
                    var cdisabled = config === null || config === void 0 ? void 0 : config.disabled;
                    if (cdisabled) {
                        var disabled = typeof cdisabled === 'boolean' ? cdisabled : cdisabled(record);
                        return { disabled: disabled };
                    }
                }, type: config.selectionType }, defaultConfig.rowSelection), { selectedRowKeys: selecteds, onChange: selectChange });
        }
        if (pagination) {
            paginationConfig.pagination = __assign(__assign(__assign({ size: 'small', showQuickJumper: true, showSizeChanger: true, showTotal: function (total) { return "\u5171 ".concat(total, " \u6761"); }, current: page.pageNo }, config === null || config === void 0 ? void 0 : config.pagination), pagination), { onChange: pageEvent });
            if (pagination.pageNo) {
                paginationConfig.pagination.current = pagination.pageNo;
            }
        }
        else if (pagination === false) {
            paginationConfig.pagination = false;
        }
        return (0, util_1.objectMerge)(defaultConfig, null, DefaultConfigs.Table, config, paginationConfig);
    }, [config, selecteds, pagination, pageEvent, page.pageNo, selectChange]);
    var getColumns = (0, react_1.useCallback)(function (column, index, level) {
        if (!(0, permission_1.hasPermission)({ column: column, value: column.value, data: column.data }))
            return;
        var key = (0, util_1.getOrderKey)(level, index);
        if (column.children) {
            return (react_1.default.createElement(ColumnGroup, { key: key, title: column.label }, column.children.map(function (c, index) {
                return getColumns(c, index, key);
            })));
        }
        else {
            var tempColumn_1 = __assign(__assign({}, column), { config: __assign({ align: innerConfig === null || innerConfig === void 0 ? void 0 : innerConfig.align }, column.config) });
            var tableColumnConfig_1 = (0, util_1.splitConfig)(tempColumn_1.config, props_1.tableColumnProps);
            return (react_1.default.createElement(Column, __assign({ key: key, title: tempColumn_1.label, dataIndex: tempColumn_1.prop, width: tempColumn_1.width }, tableColumnConfig_1, { render: function (value, data, index) {
                    if (tempColumn_1.render) {
                        var render = void 0;
                        if (Array.isArray(tempColumn_1.render)) {
                            render = tempColumn_1.render;
                        }
                        else if (typeof tempColumn_1.render === 'function') {
                            render = tempColumn_1.render({ value: value, data: data });
                        }
                        if (Array.isArray(render)) {
                            return getColumnDom(render, data, index);
                        }
                        else {
                            return render;
                        }
                    }
                    else {
                        if (!tempColumn_1.type)
                            tempColumn_1.type = 'text';
                        if (tableColumnConfig_1.ellipsis) {
                            tempColumn_1.config = __assign(__assign({}, tempColumn_1.config), { title: data[tempColumn_1.prop] });
                        }
                        return getColumnDom([tempColumn_1], data, index);
                    }
                } })));
        }
    }, [getColumnDom, innerConfig === null || innerConfig === void 0 ? void 0 : innerConfig.align]);
    var tableColumns = (0, react_1.useMemo)(function () { return (columns === null || columns === void 0 ? void 0 : columns.map(function (column, index) {
        return getColumns(column, index);
    })); }, [columns, getColumns]);
    var _style = (0, react_1.useMemo)(function () { return (0, util_1.getStyle)(keyName, style); }, [style]);
    var _className = (0, react_1.useMemo)(function () { return (0, util_1.getClass)(keyName, className); }, [className]);
    return (react_1.default.createElement(antd_1.Table, __assign({ style: _style, className: _className, dataSource: innerData, onChange: tableChange }, innerConfig), tableColumns));
}
FTable[props_1.isRenderComponent] = true;
exports.default = FTable;
