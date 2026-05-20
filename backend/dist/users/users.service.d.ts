import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { AppConfigService } from "../config/app-config.service";
export declare class UsersService {
    private userRepository;
    private configService;
    constructor(userRepository: Repository<User>, configService: AppConfigService);
    private cleanPhone;
    private buildPhoneHash;
    findOneByPhone(phone: string): Promise<User | undefined>;
    findById(id: string): Promise<User | undefined>;
    findByIdWithSecurityFields(id: string): Promise<User | undefined>;
    findOneByPhoneWithSecurityFields(phone: string): Promise<User | undefined>;
    update(id: string, updateData: Partial<User>): Promise<void>;
    create(user: Partial<User>): Promise<User>;
    findAll(): Promise<User[]>;
    findChildren(parentId: string): Promise<User[]>;
    isChildOfParent(parentId: string, childId: string): Promise<boolean>;
    addChild(parentId: string, childId: string): Promise<void>;
    anonymize(id: string): Promise<void>;
    count(): Promise<number>;
}
