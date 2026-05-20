import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Consent } from "./entities/consent.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(Consent)
    private consentRepository: Repository<Consent>,
    private usersService: UsersService,
  ) {}

  async grantConsent(
    patientId: string,
    consentType: string,
    metadata: any,
  ): Promise<Consent> {
    let consent = await this.consentRepository.findOne({
      where: { patient: { id: patientId }, consentType },
    });

    if (!consent) {
      consent = this.consentRepository.create({
        patient: { id: patientId } as any,
        consentType,
      });
    }

    consent.isGranted = true;
    consent.grantedAt = new Date();
    consent.revokedAt = null;
    consent.ipAddress = metadata.ip;
    consent.userAgent = metadata.userAgent;

    return this.consentRepository.save(consent);
  }

  async revokeConsent(
    patientId: string,
    consentType: string,
  ): Promise<Consent> {
    const consent = await this.consentRepository.findOne({
      where: { patient: { id: patientId }, consentType },
    });

    if (!consent) {
      throw new NotFoundException(
        `Consent for type ${consentType} not found for this patient`,
      );
    }

    consent.isGranted = false;
    consent.revokedAt = new Date();

    return this.consentRepository.save(consent);
  }

  async getPatientConsents(patientId: string): Promise<Consent[]> {
    return this.consentRepository.find({
      where: { patient: { id: patientId } },
    });
  }

  async requestDataDeletion(patientId: string): Promise<void> {
    // 1. Mark all consents as revoked
    await this.consentRepository.update(
      { patient: { id: patientId } },
      { isGranted: false, revokedAt: new Date() },
    );

    // 2. Anonymize user data
    await this.usersService.anonymize(patientId);
  }
}
