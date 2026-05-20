export declare const logger: {
    error: (message: string, trace?: string, context?: string) => void;
    warn: (message: string, context?: string) => void;
    info: (message: string, context?: string) => void;
    http: (message: string, context?: string) => void;
    debug: (message: string, context?: string) => void;
};
export default logger;
