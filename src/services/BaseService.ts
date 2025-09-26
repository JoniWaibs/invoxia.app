import { PrismaClient } from '@prisma/client';
import { ValidationError } from '@shared/errors';

export class BaseService {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  protected async transaction<T>(
    callback: (
      prisma: Omit<
        PrismaClient,
        '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
      >
    ) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  protected validateCuit(cuit: string): void {
    // Remove any non-numeric characters
    const cleanCuit = cuit.replace(/\D/g, '');

    if (cleanCuit.length !== 11) {
      throw new ValidationError('CUIT must be 11 digits long');
    }

    // Basic CUIT validation algorithm
    const digits = cleanCuit.split('').map(Number);
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i]! * multipliers[i]!;
    }

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;

    if (checkDigit !== digits[10]!) {
      throw new ValidationError('Invalid CUIT check digit');
    }
  }

  protected validateFilePaths(certPath: string, keyPath: string): void {
    if (!certPath.endsWith('.crt') && !certPath.endsWith('.pem')) {
      throw new ValidationError(
        'Certificate file must have .crt or .pem extension'
      );
    }

    if (!keyPath.endsWith('.key') && !keyPath.endsWith('.pem')) {
      throw new ValidationError('Key file must have .key or .pem extension');
    }

    if (certPath === keyPath) {
      throw new ValidationError('Certificate and key paths must be different');
    }
  }
}
