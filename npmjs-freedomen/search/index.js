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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var form_1 = __importDefault(require("../form"));
var props_1 = require("../config/props");
function Search(props) {
    return react_1.default.createElement(form_1.default, __assign({ config: { layout: 'inline', labelCol: undefined } }, props));
}
Search[props_1.isRenderComponent] = true;
exports.default = Search;
