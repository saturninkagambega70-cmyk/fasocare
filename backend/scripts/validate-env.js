"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const env_validation_1 = require("../src/config/env.validation");
console.log('--- Env Validation ---');
const envPath = path.resolve(process.cwd(), '.env');
const localEnvPath = path.resolve(process.cwd(), '.env.local');
let envConfig = {};
if (fs.existsSync(localEnvPath)) {
    console.log(`Using .env.local file`);
    envConfig = dotenv.parse(fs.readFileSync(localEnvPath));
}
else if (fs.existsSync(envPath)) {
    console.log(`Using .env file`);
    envConfig = dotenv.parse(fs.readFileSync(envPath));
}
else {
    console.log(`No .env file found. Using process.env`);
    envConfig = process.env;
}
try {
    (0, env_validation_1.validate)(envConfig);
    console.log('✅ Environment configuration is valid for production/deployment.');
    process.exit(0);
}
catch (error) {
    console.error('❌ Environment configuration is invalid:');
    console.error(error.message);
    process.exit(1);
}
//# sourceMappingURL=validate-env.js.map