import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
  NotFoundException,
} from "@nestjs/common";
import { PharmacyService } from "./pharmacy.service";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "../users/entities/user.entity";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Public } from "../auth/public.decorator";

@Controller("pharmacies")
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
  findAll() {
    return this.pharmacyService.findAll();
  }

  @Get("public")
  findAllPublic() {
    return this.pharmacyService.findAllPublic();
  }

  @Get("my-pharmacies")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHARMACIST)
  findMyPharmacies(@Request() req) {
    return this.pharmacyService.findByAdmin(req.user.userId);
  }

  @Get(":id/stock")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHARMACIST, UserRole.ADMIN)
  getStock(@Param("id") id: string, @Request() req: any) {
    return this.pharmacyService.getStock(id, req.user);
  }

  @Put("stock/:stockId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHARMACIST)
  updateStock(
    @Param("stockId") stockId: string,
    @Body("quantity") quantity: number,
    @Request() req: any,
  ) {
    return this.pharmacyService.updateStock(stockId, quantity, req.user);
  }

  @Get("low-stock-alerts")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHARMACIST)
  getLowStockAlerts(@Request() req) {
    return this.pharmacyService.getLowStockAlerts(req.user.userId);
  }

  @Get("stats")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHARMACIST)
  getStats(@Request() req) {
    return this.pharmacyService.getStats(req.user.userId);
  }

  @Get("verify-cachet/:token")
  @Public()
  async verifyCachet(@Param("token") token: string) {
    return this.pharmacyService.verifyCachetToken(token);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
  create(@Body() data: any, @Request() req: any) {
    // If pharmacist, force them as admin of the new pharmacy
    const pharmacyData =
      req.user.role === UserRole.PHARMACIST
        ? { ...data, admin: { id: req.user.userId } }
        : data;
    return this.pharmacyService.createPharmacy(pharmacyData);
  }
}
