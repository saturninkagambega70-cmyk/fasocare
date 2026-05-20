import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { validate } from "../config/env.validation";

// Script to manually validate the environment during CI/CD checks
console.log("--- Env Validation ---");

const envPath = path.resolve(process.cwd(), ".env");
const localEnvPath = path.resolve(process.cwd(), ".env.local");

let envConfig = {};

if (fs.existsSync(localEnvPath)) {
  console.log(`Using .env.local file`);
  envConfig = dotenv.parse(fs.readFileSync(localEnvPath));
} else if (fs.existsSync(envPath)) {
  console.log(`Using .env file`);
  envConfig = dotenv.parse(fs.readFileSync(envPath));
} else {
  console.log(`No .env file found. Using process.env`);
  envConfig = process.env;
}

try {
  validate(envConfig);
  console.log(
    "✅ Environment configuration is valid for production/deployment.",
  );
  process.exit(0);
} catch (error: any) {
  console.error("❌ Environment configuration is invalid:");
  console.error(error.message);
  process.exit(1);
}
