
import { BASE_API_URL, API_ENDPOINTS, HashLibAlgorithm, RsaKeySizeType } from "@/config/api";

// Error handler
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to get error details if available
    try {
      const errorData = await response.json();
      throw new Error(
        errorData.detail?.[0]?.msg || 
        JSON.stringify(errorData) || 
        `API Error: ${response.status} ${response.statusText}`
      );
    } catch (e) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  }
  return response.json();
};

// Get a random token
export const getRandomToken = async (): Promise<string> => {
  const response = await fetch(API_ENDPOINTS.RANDOM_TOKEN, {
    method: "GET",
    headers: {
      "accept": "application/json",
    },
  });
  
  const data = await handleResponse(response);
  return data;
};

// Create Argon2 hash
export interface Argon2HashParams {
  payload: string;
  length?: number; // default = 32, ge = 8, le = 32
  memory_cost?: number; // default = 65536, le = 244141
}

export const createArgon2Hash = async (params: Argon2HashParams): Promise<{ hash: string }> => {
  const response = await fetch(API_ENDPOINTS.ARGON2_HASH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify(params),
  });
  
  return handleResponse(response);
};

// Create Bcrypt hash
export interface BcryptHashParams {
  payload: string;
  rounds?: number; // default = 12, ge = 8, le = 32
}

export const createBcryptHash = async (params: BcryptHashParams): Promise<{ hash: string }> => {
  const response = await fetch(API_ENDPOINTS.BCRYPT_HASH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify(params),
  });
  
  return handleResponse(response);
};

// Create hash using hashlib
export interface HashLibParams {
  algorithm: HashLibAlgorithm;
  payload: string;
}

export const createHashLibHash = async (params: HashLibParams): Promise<{ hash: string }> => {
  const response = await fetch(`${API_ENDPOINTS.HASHLIB}?algorithm=${params.algorithm}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({ payload: params.payload }),
  });
  
  return handleResponse(response);
};

// Generate RSA private key
export interface RsaKeyResponse {
  private_key: string;
}

export const generateRsaKey = async (keySize: RsaKeySizeType, password?: string): Promise<RsaKeyResponse> => {
  const response = await fetch(`${API_ENDPOINTS.GENRSA_PRIVATE_KEY}?key_size=${keySize}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({ password: password || null }),
  });
  
  return handleResponse(response);
};

// Generate ED25519 private key
export interface Ed25519KeyResponse {
  private_key: string;
}

export const generateEd25519Key = async (password?: string): Promise<Ed25519KeyResponse> => {
  const response = await fetch(API_ENDPOINTS.GENED25519_PRIVATE_KEY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({ password: password || null }),
  });
  
  return handleResponse(response);
};

// Generate public key from private key
export interface PublicKeyResponse {
  public_key: string;
}

export interface GeneratePublicKeyParams {
  private_key: string; // Contains the private key in PEM format
  password?: string;
}

export const generatePublicKey = async (params: GeneratePublicKeyParams): Promise<PublicKeyResponse> => {
  const response = await fetch(API_ENDPOINTS.GEN_PUBLIC_KEY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({
      private_key: params.private_key,
      password: params.password || null
    }),
  });
  
  return handleResponse(response);
};

// Upload file and get checksum
export interface FileChecksumResponse {
  filename: string;
  algorithm: string;
  hash: string;
  size: number;
}

export const getFileChecksum = async (file: File, algorithm: HashLibAlgorithm): Promise<FileChecksumResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${API_ENDPOINTS.FILE_SUM}?algorithm=${algorithm}`, {
    method: "POST",
    headers: {
      "accept": "application/json",
    },
    body: formData,
  });
  
  return handleResponse(response);
};
