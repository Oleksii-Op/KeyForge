
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { generateRsaKey, generateEd25519Key, RsaKeyResponse, Ed25519KeyResponse } from "@/services/apiService";
import { RsaKeySizeType, VALIDATION } from "@/config/api";
import KeyGenerationForm from "@/components/key/KeyGenerationForm";
import KeyDisplay from "@/components/key/KeyDisplay";
import KeyGenerationError from "@/components/key/KeyGenerationError";

interface KeyState {
  privateKey: string;
  isLoading: boolean;
  error: string | null;
}

const KeyGeneration = () => {
  const [keyType, setKeyType] = useState<'rsa' | 'ed25519'>('rsa');
  const [rsaKeySize, setRsaKeySize] = useState<RsaKeySizeType>("2048");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [rsaKeyState, setRsaKeyState] = useState<KeyState>({
    privateKey: "",
    isLoading: false,
    error: null,
  });
  const [ed25519KeyState, setEd25519KeyState] = useState<KeyState>({
    privateKey: "",
    isLoading: false,
    error: null,
  });

  const currentKeyState = keyType === 'rsa' ? rsaKeyState : ed25519KeyState;

  // Validate inputs
  useEffect(() => {
    if (password.length > VALIDATION.KEY.PASSWORD.MAX_LENGTH) {
      setValidationError(`Password must be at most ${VALIDATION.KEY.PASSWORD.MAX_LENGTH} characters`);
    } else {
      setValidationError(null);
    }
  }, [password]);

  const handleKeyTypeChange = (value: 'rsa' | 'ed25519') => {
    setKeyType(value);
  };

  const handleRsaKeySizeChange = (value: RsaKeySizeType) => {
    setRsaKeySize(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const generateKeys = async () => {
    // Validate before generating
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (keyType === 'rsa') {
      setRsaKeyState({
        ...rsaKeyState,
        isLoading: true,
        error: null,
      });

      try {
        const result: RsaKeyResponse = await generateRsaKey(
          rsaKeySize,
          password || undefined
        );
        
        setRsaKeyState({
          privateKey: result.private_key,
          isLoading: false,
          error: null,
        });
        toast.success("RSA private key generated successfully");
      } catch (error) {
        console.error("Error generating RSA key:", error);
        setRsaKeyState({
          ...rsaKeyState,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        toast.error("Failed to generate RSA key");
      }
    } else {
      setEd25519KeyState({
        ...ed25519KeyState,
        isLoading: true,
        error: null,
      });

      try {
        const result: Ed25519KeyResponse = await generateEd25519Key(
          password || undefined
        );
        
        setEd25519KeyState({
          privateKey: result.private_key,
          isLoading: false,
          error: null,
        });
        toast.success("ED25519 private key generated successfully");
      } catch (error) {
        console.error("Error generating ED25519 key:", error);
        setEd25519KeyState({
          ...ed25519KeyState,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        toast.error("Failed to generate ED25519 key");
      }
    }
  };

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container max-w-4xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Key Generation</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate secure cryptographic keys for various applications and protocols.
            </p>
          </motion.div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generate Private Key</CardTitle>
              <CardDescription>
                Select key type and parameters to generate a secure private key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <KeyGenerationForm
                keyType={keyType}
                rsaKeySize={rsaKeySize}
                password={password}
                showPassword={showPassword}
                isLoading={currentKeyState.isLoading}
                onKeyTypeChange={handleKeyTypeChange}
                onRsaKeySizeChange={handleRsaKeySizeChange}
                onPasswordChange={handlePasswordChange}
                onTogglePasswordVisibility={handleTogglePasswordVisibility}
                onGenerateKeys={generateKeys}
              />
            </CardContent>
          </Card>

          <KeyDisplay 
            privateKey={currentKeyState.privateKey}
            keyType={keyType}
            rsaKeySize={keyType === 'rsa' ? rsaKeySize : undefined}
            isPasswordProtected={!!password}
            password={password || undefined}
          />

          <KeyGenerationError error={currentKeyState.error} />
        </div>
      </section>
    </Layout>
  );
};

export default KeyGeneration;
