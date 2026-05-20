import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
  Put,
  Post,
  Body,
  Request,
  ForbiddenException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { Public } from "../auth/public.decorator";
import { UserRole } from "./entities/user.entity";
import { QrService } from "../medical/qr.service";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly qrService: QrService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HEALTH_MINISTRY)
  async findAll() {
    const users = await this.usersService.findAll();
    return { users, total: users.length };
  }

  @Public()
  @Get("find/:phone")
  async findByPhone(@Param("phone") phone: string) {
    const user = await this.usersService.findOneByPhone(phone);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");
    const { passwordHash, refreshTokenHash, ...result } = user;
    return result;
  }

  @Get("id/:id")
  @Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PHARMACIST, UserRole.PARENT)
  async findById(@Param("id") id: string, @Request() req: any) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");
    if (
      req.user.activeRole === UserRole.PARENT ||
      req.user.roles?.includes(UserRole.PARENT)
    ) {
      const isChild = await this.usersService.isChildOfParent(
        req.user.userId,
        id,
      );
      if (!isChild)
        throw new ForbiddenException(
          "Vous ne pouvez consulter que les profils de vos enfants.",
        );
    }
    const { passwordHash, refreshTokenHash, ...result } = user;
    return result;
  }

  @Put("self-verify")
  async selfVerify(@Request() req) {
    throw new ForbiddenException(
      "La vérification de compte doit passer par le workflow d'accréditation administrative.",
    );
  }

  @Post(":id/validate")
  @Roles(UserRole.ADMIN)
  async validateUser(@Param("id") id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    // Générer une paire de clés RSA pour les docteurs/pharmaciens
    if (
      user.roles?.includes(UserRole.DOCTOR) ||
      user.roles?.includes(UserRole.PHARMACIST)
    ) {
      const { publicKey } = this.qrService.generateRSAKeyPair();
      await this.usersService.update(id, { isVerified: true, publicKey });
    } else {
      await this.usersService.update(id, { isVerified: true });
    }
    return { message: "Utilisateur validé avec succès" };
  }

  @Post(":id/suspend")
  @Roles(UserRole.ADMIN)
  async suspendUser(@Param("id") id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");
    await this.usersService.update(id, { isVerified: false });
    return { message: "Utilisateur suspendu" };
  }

  @Get("me")
  @Roles(
    UserRole.PATIENT,
    UserRole.DOCTOR,
    UserRole.ADMIN,
    UserRole.PHARMACIST,
    UserRole.PARENT,
    UserRole.HEALTH_MINISTRY,
    UserRole.INSPECTOR,
  )
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");
    const { passwordHash, refreshTokenHash, ...result } = user;
    return result;
  }

  @Put("me")
  @Roles(
    UserRole.PATIENT,
    UserRole.DOCTOR,
    UserRole.ADMIN,
    UserRole.PHARMACIST,
    UserRole.PARENT,
  )
  async updateProfile(@Request() req, @Body() data: any) {
    await this.usersService.update(req.user.userId, data);
    const user = await this.usersService.findById(req.user.userId);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");
    const { passwordHash, refreshTokenHash, ...result } = user;
    return result;
  }

  @Get("children")
  @Roles(UserRole.PARENT)
  async getChildren(@Request() req) {
    return this.usersService.findChildren(req.user.userId);
  }

  @Post("children/add")
  @Roles(UserRole.PARENT)
  async addChild(@Request() req, @Body("childPhone") childPhone: string) {
    const child = await this.usersService.findOneByPhone(childPhone);
    if (!child) throw new NotFoundException("Enfant non trouvé avec ce numéro");
    await this.usersService.addChild(req.user.userId, child.id);
    return { message: "Enfant lié avec succès" };
  }
}
