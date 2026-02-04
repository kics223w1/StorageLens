
import { Delta } from 'jsondiffpatch';

export interface DiffResult {
    key: string;
    status: 'added' | 'removed' | 'modified' | 'unchanged';
    oldValue: any;
    newValue: any;
}

export function flattenDelta(delta: Delta | undefined, originalLeft: Record<string, any>, currentRight: Record<string, any>): DiffResult[] {
    if (!delta) return [];
    
    const results: DiffResult[] = [];
    
    // Sort keys for consistent display
    const keys = Object.keys(delta).sort();

    for (const key of keys) {
        // jsondiffpatch delta contains keys that changed.
        // We can determine status by checking existence in original and current.
        
        const inLeft = Object.prototype.hasOwnProperty.call(originalLeft, key);
        const inRight = Object.prototype.hasOwnProperty.call(currentRight, key);

        if (!inLeft && inRight) {
             results.push({ key, status: 'added', oldValue: undefined, newValue: currentRight[key] });
        } else if (inLeft && !inRight) {
             results.push({ key, status: 'removed', oldValue: originalLeft[key], newValue: undefined });
        } else if (inLeft && inRight) {
             results.push({ key, status: 'modified', oldValue: originalLeft[key], newValue: currentRight[key] });
        }
    }
    
    return results;
}
