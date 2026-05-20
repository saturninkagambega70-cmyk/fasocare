import { Connection } from "typeorm";
import Redis from "ioredis";
export declare class HealthController {
    private connection;
    private readonly redis;
    constructor(connection: Connection, redis: Redis | null);
    check(): Promise<{
        status: string;
        timestamp: string;
        service: string;
        version: string;
    }>;
    checkDb(): Promise<{
        status: string;
        database: string;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        database: string;
        error: any;
        timestamp: string;
    }>;
    checkRedis(): Promise<{
        status: string;
        redis: string;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        redis: string;
        error: any;
        timestamp: string;
    }>;
    ready(): Promise<{
        status: string;
        timestamp: string;
        db?: undefined;
        redis?: undefined;
    } | {
        status: string;
        db: string;
        redis: string;
        timestamp: string;
    }>;
}
