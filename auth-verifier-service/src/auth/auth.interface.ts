export interface TokenValidationRequest {
  token: string;
  requiredRoles?: string[];
}

export interface TokenValidationResponse {
  isValid: boolean;
  payload?: any;
  error?: string;
}
