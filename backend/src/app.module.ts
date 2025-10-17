import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        if (isProduction) {
          // --- Se ejecutará con 'npm run prod' ---
          const host = configService.get<string>('DBA_HOST')!;
          const username = configService.get<string>('DBA_USERNAME')!;
          
          console.log('Connecting to PRODUCTION database (Azure SQL)...');
          console.log('Server:', host);
          console.log('Database:', configService.get<string>('DBA_DATABASE'));
          console.log('Username:', username);
          
          return {
            type: 'mssql',
            host: host,
            port: parseInt(configService.get<string>('DBA_PORT', '1433')),
            username: username,
            password: configService.get<string>('DBA_PASSWORD')!,
            database: configService.get<string>('DBA_DATABASE')!,
            autoLoadEntities: true, // Cargar entidades
            synchronize: false, // No sincronizar automáticamente en producción
            logging: true, // Activar logging para ver qué pasa
            options: {
              encrypt: true, // Requerido por Azure
              trustServerCertificate: false, // Azure SQL usa certificados válidos
              enableArithAbort: true, // Requerido por Azure SQL
              connectTimeout: 30000, // 30 segundos
              requestTimeout: 30000,
            },
            extra: {
              validateConnection: true,
              trustServerCertificate: false,
            },
          };
        } else {
          // --- Se ejecutará con 'npm run dev' ---
          console.log('Connecting to DEVELOPMENT database (Docker PostgreSQL)...');
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST')!,
            port: parseInt(configService.get<string>('DB_PORT', '5432')),
            username: configService.get<string>('DB_USER')!,
            password: configService.get<string>('DB_PASS')!,
            database: configService.get<string>('DB_NAME')!,
            autoLoadEntities: true,
            synchronize: true, // Ok para desarrollo
          };
        }
      },
    }),

    AuthModule,
    PatientsModule,
  ],
})
export class AppModule {}