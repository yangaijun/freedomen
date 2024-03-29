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
var base_1 = require("../../utils/base");
var antd_1 = require("antd");
var react_1 = __importStar(require("react"));
var useBase_1 = require("../../hooks/useBase");
var MarginLoadingOutlined_1 = __importDefault(require("../MarginLoadingOutlined"));
var props_1 = require("../../config/props");
var ridKeys = ['maxcount', 'filterable', props_1.names.labelname, props_1.names.valuename, props_1.names.optionvalue];
var types = {
    'select-multiple': 'select-multiple'
};
function FSelect(props) {
    var item = props.item;
    var style = (0, useBase_1.useStyle)(props);
    var onChange = (0, useBase_1.useChange)(props);
    var disabled = (0, useBase_1.useDisabled)(props);
    var className = (0, useBase_1.useClassName)(props);
    var _a = (0, useBase_1.useOptions)(props), options = _a.options, loading = _a.loading;
    var itemStyles = (0, useBase_1.useItemStyle)(props, options);
    var config = (0, useBase_1.useConfig)(props);
    var ridKeysConfig = (0, useBase_1.useRidkeyConfig)(config, ridKeys);
    var _b = (0, useBase_1.useOptionIOValue)(config, options, item.value), innerValue = _b.innerValue, outerValue = _b.outerValue;
    var _c = (0, useBase_1.useOptionNames)(config), labelname = _c.labelname, valuename = _c.valuename;
    var type = (0, base_1.getOriginalType)(item);
    var dropdownRender = (0, react_1.useCallback)(function (menu) {
        return loading ? react_1.default.createElement(MarginLoadingOutlined_1.default, null) : menu;
    }, [loading]);
    var innerChange = (0, react_1.useCallback)(function (value) {
        if (config.maxcount && (config.mode === 'multiple' || type === types["select-multiple"])) {
            if (value && value.length > config.maxcount) {
                antd_1.message.info("\u6700\u591A\u9009\u62E9".concat(config.maxcount, "\u9879"));
                return;
            }
        }
        onChange(outerValue(value));
    }, [config, type, outerValue, onChange]);
    var filterableProps = (0, react_1.useMemo)(function () {
        if (config.filterable) {
            return {
                showSearch: true,
                filterOption: function (input, option) {
                    if (input === void 0) { input = ''; }
                    return (0, base_1.filterNode)(input, option, labelname, valuename);
                }
            };
        }
    }, [config.filterable, labelname, valuename]);
    return (0, react_1.useMemo)(function () {
        return react_1.default.createElement(antd_1.Select, __assign({ style: style, optionLabelProp: "label", mode: type === types["select-multiple"] && 'multiple', value: innerValue, onChange: innerChange, className: className, disabled: disabled, placeholder: item.placeholder, dropdownRender: dropdownRender }, filterableProps, ridKeysConfig), options.map(function (option, index) { return (react_1.default.createElement(antd_1.Select.Option, { key: option[valuename], style: itemStyles[index], disabled: option.disabled, label: option[labelname], value: option[valuename] }, option.option || option[labelname])); }));
    }, [style, type, labelname, valuename, filterableProps, itemStyles, innerChange, className, disabled, innerValue, item.placeholder, dropdownRender, ridKeysConfig, options]);
}
exports.default = FSelect;
