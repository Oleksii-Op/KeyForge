
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, ShieldAlert, Key } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { generatePublicKey } from "@/services/apiService";

interface KeyDisplayProps {
  privateKey: string;
  keyType: 'rsa' | 'ed25519';
  rsaKeySize?: string;
  isPasswordProtected: boolean;
  password?: string;
}

const KeyDisplay = ({ privateKey, keyType, rsaKeySize, isPasswordProtected, password }: KeyDisplayProps) => {
  const [copiedState, setCopiedState] = useState(false);
  const [publicKey, setPublicKey] = useState<string>("");
  const [isGeneratingPublicKey, setIsGeneratingPublicKey] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [publicKeyError, setPublicKeyError] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: 'private' | 'public') => {
    if (!text) return;
    
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    toast.success(`${type === 'private' ? 'Private' : 'Public'} key copied to clipboard`);
    
    setTimeout(() => {
      setCopiedState(false);
    }, 2000);
  };

  const handleGeneratePublicKey = async () => {
    if (!privateKey) return;

    setIsGeneratingPublicKey(true);
    setPublicKeyError(null);
    
    try {
      const result = await generatePublicKey({ 
        private_key: privateKey, 
        password: password
      });
      
      setPublicKey(result.public_key);
      setShowPublicKey(true);
      toast.success("Public key generated successfully");
    } catch (error) {
      console.error("Error generating public key:", error);
      setPublicKeyError(error instanceof Error ? error.message : "Failed to generate public key");
      toast.error(error instanceof Error ? error.message : "Failed to generate public key");
    } finally {
      setIsGeneratingPublicKey(false);
    }
  };

  if (!privateKey) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Generated Private Key</CardTitle>
          <CardDescription>
            {keyType === 'rsa' ? `RSA ${rsaKeySize} bits` : 'ED25519'} private key
            {isPasswordProtected ? ' (encrypted with password)' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="p-4 bg-muted rounded-md h-60 overflow-auto font-mono text-sm break-all whitespace-pre-wrap">
              {privateKey.replace(/\\n/g, '\n')}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1"
              onClick={() => copyToClipboard(privateKey, 'private')}
            >
              {copiedState ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy key</span>
            </Button>
          </div>
          
          <Button 
            onClick={handleGeneratePublicKey}
            disabled={isGeneratingPublicKey}
            className="w-full"
          >
            <Key className="h-4 w-4 mr-2" />
            {isGeneratingPublicKey ? "Generating Public Key..." : "Generate Public Key"}
          </Button>

          {publicKeyError && (
            <div className="p-4 bg-destructive/10 rounded-lg flex items-center text-destructive">
              <ShieldAlert className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">{publicKeyError}</span>
            </div>
          )}

          {showPublicKey && publicKey && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Public Key</h3>
              <div className="relative">
                <div className="p-4 bg-muted rounded-md h-40 overflow-auto font-mono text-sm break-all whitespace-pre-wrap">
                  {publicKey.replace(/\\n/g, '\n')}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1"
                  onClick={() => copyToClipboard(publicKey, 'public')}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy public key</span>
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-8 px-4 py-3 bg-destructive/10 rounded-lg text-sm flex items-center">
            <ShieldAlert className="h-4 w-4 mr-2 text-destructive" />
            <span className="text-destructive font-medium">
              WARNING: Store this private key securely. Never share it with anyone.
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default KeyDisplay;
