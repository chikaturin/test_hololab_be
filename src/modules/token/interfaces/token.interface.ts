export interface TokenPayload {
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface DeviceInfo {
  deviceName: string;
  deviceType: string;
  os: string;
  browser: string;
  ipAddress: string;
}

export interface TokenRedis {
  refresh_token: string;
  user_agent: string;
  ip_address: string;
  device_info: DeviceInfo;
  created_at: string;
  expires_at: string;
  revoked: boolean;
}

export interface SessionData extends TokenRedis {
  session_id: string;
}
