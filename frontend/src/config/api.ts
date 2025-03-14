
// Read the base API URL from environment variables with a fallback
export const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  RANDOM_TOKEN: `${BASE_API_URL}/api/random-token`,
  ARGON2_HASH: `${BASE_API_URL}/api/argon2-hash`,
  BCRYPT_HASH: `${BASE_API_URL}/api/bcrypt-hash`,
  HASHLIB: `${BASE_API_URL}/api/hashlib`,
  GENRSA_PRIVATE_KEY: `${BASE_API_URL}/api/genrsa-private-key`,
  GENED25519_PRIVATE_KEY: `${BASE_API_URL}/api/gened25519-private-key`,
  GEN_PUBLIC_KEY: `${BASE_API_URL}/api/gen-public-key`,
  FILE_SUM: `${BASE_API_URL}/api/file-sum`,
};

export type HashLibAlgorithm = "sha256" | "sha384" | "sha512" | "md5";
export type RsaKeySizeType = "1024" | "2048" | "4096" | "8192";

// Validation constants based on backend documentation
export const VALIDATION = {
  PAYLOAD: {
    MAX_LENGTH: 256,
    MIN_LENGTH: 0
  },
  ARGON2: {
    LENGTH: {
      DEFAULT: 32,
      MIN: 8,
      MAX: 32
    },
    MEMORY_COST: {
      DEFAULT: 65536,
      MIN: 8,
      MAX: 244141
    }
  },
  BCRYPT: {
    ROUNDS: {
      DEFAULT: 12,
      MIN: 8,
      MAX: 32
    }
  },
  KEY: {
    PASSWORD: {
      MAX_LENGTH: 128,
      MIN_LENGTH: 0
    }
  }
};