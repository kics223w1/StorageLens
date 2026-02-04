
declare module 'jsondiffpatch' {
    export interface Delta {
        [key: string]: any;
    }
    export interface DiffPatcher {
        diff(left: any, right: any): Delta | undefined;
    }
    export function create(options?: any): DiffPatcher;
}
