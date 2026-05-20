import { ValueTransformer } from "typeorm";
export declare class EncryptionTransformer implements ValueTransformer {
    private static get encryptionKey();
    to(value: string | any): string | any;
    from(value: string | any): string | any;
}
