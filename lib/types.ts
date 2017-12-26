import * as url from "url";
import {Map} from 'immutable'

export type ServerIncoming = string|string[]|IServerOption;

export interface IServerOption {
    baseDir: string[]
    index?: string
    directory?: boolean
    serveStaticOptions?: any
    routes?: {[route: string]: string}
    middleware?: MiddlewareInput
}

export type MiddlewareInput = Function | Function[] | Middleware | Middleware[];

export interface Middleware {
    route: string
    id?: string
    handle: Function
}

export type BrowsersyncProxyIncoming = string|BrowsersyncProxy;
export interface BrowsersyncProxy {
    target: string
    url: Map<string, any>
    middleware?: MiddlewareInput
}

export type PortsOption = {
    min: number|null
    max: number|null
}

export type FilesObject = {match: string[], fn?: Function, options?: any}
export type FilesNamespace = {globs: string[], objs: FilesObject[] }
export type FilesNamespaces = {[name: string]: FilesNamespace}
