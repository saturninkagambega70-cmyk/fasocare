import { plainToInstance } from "class-transformer";
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  validateSync,
} from "class-validator";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNotEmpty({
    message: "JWT_SECRET is required and must be at least 32 characters",
  })
  JWT_SECRET: string;

  @IsNotEmpty({
    message:
      "JWT_REFRESH_SECRET is required and must be at least 32 characters",
  })
  JWT_REFRESH_SECRET: string;

  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  @IsOptional()
  DB_PORT: number = 5432;

  @IsNotEmpty()
  DB_USERNAME: string;

  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsNotEmpty()
  DB_DATABASE: string;

  @IsOptional()
  DB_SSL: string = "false";

  @IsOptional()
  ENCRYPTION_KEY: string;

  @IsOptional()
  AT_API_KEY: string;

  @IsOptional()
  AT_USERNAME: string;

  @IsOptional()
  REDIS_HOST: string = "localhost";

  @IsNumber()
  @IsOptional()
  REDIS_PORT: number = 6379;

  @IsOptional()
  REDIS_PASSWORD: string;

  @IsOptional()
  CORS_ORIGINS: string = "http://localhost:3000";

  @IsNumber()
  @IsOptional()
  JWT_ACCESS_EXPIRATION: number = 900;

  @IsNumber()
  @IsOptional()
  JWT_REFRESH_EXPIRATION: number = 604800;
}

export function validate(config: Record<string, unknown>) {
  // Validate required vars based on environment
  const env = (config.NODE_ENV as string) || "development";

  if (env === "production") {
    if (!config.JWT_SECRET || (config.JWT_SECRET as string).length < 32) {
      throw new Error(
        "JWT_SECRET must be at least 32 characters in production",
      );
    }
    if (
      !config.JWT_REFRESH_SECRET ||
      (config.JWT_REFRESH_SECRET as string).length < 32
    ) {
      throw new Error(
        "JWT_REFRESH_SECRET must be at least 32 characters in production",
      );
    }
  }
  if (!config.ENCRYPTION_KEY || (config.ENCRYPTION_KEY as string).length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters");
  }

  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: env === "development",
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map(
        (err) =>
          `${err.property}: ${Object.values(err.constraints || {}).join(", ")}`,
      )
      .join("\n");
    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return validatedConfig;
}
