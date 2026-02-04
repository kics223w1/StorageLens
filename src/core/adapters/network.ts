export interface NetworkLog {
  id: string;
  method: string;
  url: string;
  domain: string;
  file: string;
  status: number;
  type: string;
  transferred: string;
  size: string;
  time: string;
  timestamp: number;
}

export class NetworkParser {
  static fromPerformanceEntry(entry: PerformanceResourceTiming): NetworkLog {
    const url = new URL(entry.name);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || '/';
    
    // PerformanceResourceTiming doesn't natively support method or status in all browsers consistently for all types,
    // but for 'resource' entries, it's limited. 
    // However, recent specs allow some info. Lacking that, we default to reasonable values.
    // 'initiatorType' helps guess the type.
    
    return {
      id: crypto.randomUUID(),
      method: 'GET', // Default assumption as performance API doesn't strictly give this for all resources
      url: entry.name,
      domain: url.hostname,
      file: filename,
      status: 200, // Default assumption, actual status code access is restricted in performance API for distinct origins without Timing-Allow-Origin
      type: entry.initiatorType || 'other',
      transferred: this.formatBytes(entry.transferSize),
      size: this.formatBytes(entry.decodedBodySize || entry.transferSize),
      time: `${Math.round(entry.duration)} ms`,
      timestamp: entry.startTime
    };
  }

  static parse(content: string): NetworkLog[] {
      // Placeholder for HAR parsing if needed later
      return [];
  }

  private static formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}
