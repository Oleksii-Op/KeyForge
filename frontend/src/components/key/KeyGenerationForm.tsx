
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { KeyRound, KeySquare, Eye, EyeOff, Info, RefreshCw, AlertCircle } from "lucide-react";
import { RsaKeySizeType, VALIDATION } from "@/config/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface KeyGenerationFormProps {
  keyType: 'rsa' | 'ed25519';
  rsaKeySize: RsaKeySizeType;
  password: string;
  showPassword: boolean;
  isLoading: boolean;
  onKeyTypeChange: (value: 'rsa' | 'ed25519') => void;
  onRsaKeySizeChange: (value: RsaKeySizeType) => void;
  onPasswordChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
  onGenerateKeys: () => void;
}

const KeyGenerationForm = ({
  keyType,
  rsaKeySize,
  password,
  showPassword,
  isLoading,
  onKeyTypeChange,
  onRsaKeySizeChange,
  onPasswordChange,
  onTogglePasswordVisibility,
  onGenerateKeys
}: KeyGenerationFormProps) => {
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const maxPasswordLength = VALIDATION.KEY.PASSWORD.MAX_LENGTH;
  
  useEffect(() => {
    // Validate password
    if (password.length > maxPasswordLength) {
      setPasswordError(`Password must be at most ${maxPasswordLength} characters`);
    } else {
      setPasswordError(null);
    }
  }, [password, maxPasswordLength]);

  const isFormValid = !passwordError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="key-type" className="mr-2">Key Type</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-medium">Choosing a Key Type:</p>
                  <p className="text-sm mt-1">
                    <strong>RSA:</strong> Traditional asymmetric algorithm with wide compatibility. Uses longer keys (2048-4096 bits) and is more computationally intensive. Ideal for compatibility with older systems.
                  </p>
                  <p className="text-sm mt-1">
                    <strong>ED25519:</strong> Modern elliptic curve algorithm with shorter keys (256 bits) while providing strong security. Faster operations and smaller signatures make it ideal for high-performance applications.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select 
            value={keyType} 
            onValueChange={(value: 'rsa' | 'ed25519') => {
              onKeyTypeChange(value);
            }}
          >
            <SelectTrigger id="key-type">
              <SelectValue placeholder="Select key type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rsa">
                <div className="flex items-center">
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>RSA</span>
                </div>
              </SelectItem>
              <SelectItem value="ed25519">
                <div className="flex items-center">
                  <KeySquare className="mr-2 h-4 w-4" />
                  <span>ED25519</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {keyType === 'rsa' && (
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="key-size" className="mr-2">Key Size</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-medium">RSA Key Size:</p>
                    <p className="text-sm mt-1">
                      <strong>1024 bits:</strong> Fastest but least secure. Suitable for testing only.
                    </p>
                    <p className="text-sm mt-1">
                      <strong>2048 bits:</strong> Recommended for most applications. Good balance of security and performance.
                    </p>
                    <p className="text-sm mt-1">
                      <strong>4096 bits:</strong> Higher security for sensitive data, but slower key generation and operations.
                    </p>
                    <p className="text-sm mt-1">
                      <strong>8192 bits:</strong> Maximum security for critical applications, with significant performance impact.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={rsaKeySize} onValueChange={(value: RsaKeySizeType) => onRsaKeySizeChange(value)}>
              <SelectTrigger id="key-size">
                <SelectValue placeholder="Select key size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1024">1024 bits (less secure)</SelectItem>
                <SelectItem value="2048">2048 bits (recommended)</SelectItem>
                <SelectItem value="4096">4096 bits (more secure)</SelectItem>
                <SelectItem value="8192">8192 bits (extremely secure)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password (Optional)</Label>
            <span className={`text-xs ${password.length > maxPasswordLength ? 'text-destructive' : 'text-muted-foreground'}`}>
              {password.length}/{maxPasswordLength}
            </span>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password to encrypt the key"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className={passwordError ? "border-destructive" : ""}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={onTogglePasswordVisibility}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            If provided, the private key will be encrypted with this password
          </p>
        </div>
        
        {passwordError && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm ml-2">
              {passwordError}
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={onGenerateKeys} 
          className="w-full"
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              {keyType === 'rsa' ? <KeyRound className="mr-2 h-4 w-4" /> : <KeySquare className="mr-2 h-4 w-4" />}
              Generate {keyType.toUpperCase()} Key
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default KeyGenerationForm;
