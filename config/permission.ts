import { IRegionColumnItemProps } from "./type"

export interface permissionParams {
    column: IRegionColumnItemProps,
    value: any,
    data: Record<any, any> 
}

export const DefaultPermission = {
    permission: (params: permissionParams) => true
}
/**
 * 用户全局设置元素是否加载（权限）
 * @param {函数} fn 
 */
export function setPermission(fn: (params: permissionParams) => boolean) {
    if (typeof fn === 'function') {
        DefaultPermission.permission = fn
    } else {
        console.warn('permission must be function')
    }
};
/**
 * 是否有权限
 */
export function hasPermission(params: permissionParams) {
    return DefaultPermission.permission(params)
}