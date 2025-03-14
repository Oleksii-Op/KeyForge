
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface HashResultProps {
  result: string;
  activeTab: string;
  algorithm?: string;
}

const HashResult = ({ result, activeTab, algorithm }: HashResultProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    if (!result) return;
    
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    toast.success("Hash copied to clipboard");
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Hash Result</CardTitle>
          <CardDescription>
            {activeTab === "simple" 
              ? `${algorithm} hash of your input` 
              : activeTab === "argon2" 
                ? "Argon2 hash of your input" 
                : "Bcrypt hash of your input"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="p-4 bg-muted rounded-md overflow-x-auto font-mono text-sm break-all max-h-[200px] overflow-y-auto">
              {result}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1"
              onClick={copyToClipboard}
              disabled={!result}
            >
              {isCopied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy to clipboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HashResult;
