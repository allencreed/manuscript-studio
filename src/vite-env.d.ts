declare module 'sql.js' {
  export interface Database {
    exec(sql: string): Array<{ columns: string[]; values: any[][] }>;
    prepare(sql: string): Statement;
    run(sql: string, params?: any): void;
    get(sql: string, params?: any): any;
    export(): Uint8Array;
    close(): void;
    create_function(name: string, func: (...args: any[]) => any): void;
    create_aggregate(name: string, agg: { init: () => any; step: (state: any, val: any) => any; finalize?: (state: any) => any }): void;
  }
  export interface Statement {
    bind(params?: any[] | object): boolean;
    step(): boolean;
    get(): any;
    getAsObject(): any;
    free(): void;
    reset(): void;
    run(...params: any[]): void;
  }
  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer) => Database;
    default: SqlJsStatic;
  }
  export interface SqlJsConfig {
    locateFile?: (file: string) => string;
  }
  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
}
