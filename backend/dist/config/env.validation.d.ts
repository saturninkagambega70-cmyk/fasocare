declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare class EnvironmentVariables {
    NODE_ENV: Environment;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    DB_SSL: string;
    ENCRYPTION_KEY: string;
    AT_API_KEY: string;
    AT_USERNAME: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;
    CORS_ORIGINS: string;
    JWT_ACCESS_EXPIRATION: number;
    JWT_REFRESH_EXPIRATION: number;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
