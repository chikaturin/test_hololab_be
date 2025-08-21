import { IsString, IsOptional } from 'class-validator';

export class DeviceInfoDto {
  @IsString()
  @IsOptional()
  deviceName: string;

  @IsString()
  @IsOptional()
  deviceType: string;

  @IsString()
  @IsOptional()
  os: string;

  @IsString()
  @IsOptional()
  browser: string;

  @IsString()
  @IsOptional()
  ipAddress: string;
}
