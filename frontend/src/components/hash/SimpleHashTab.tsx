
import { useState, useMemo } from "react";
import { HashLibAlgorithm, VALIDATION } from "@/config/api";
import { createHashLibHash, HashLibParams } from "@/services/apiService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SimpleHashTabProps {
  input: string;
  onInputChange: (value: string) => void;
  onHashGenerated: (hash: string) => void;
}

const SimpleHashTab = ({ input, onInputChange, onHashGenerated }: SimpleHashTabProps) => {
  const [algorithm, setAlgorithm] = useState<HashLibAlgorithm>("sha256");
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation state
  const validationError = useMemo(() => {
    if (input.length > VALIDATION.PAYLOAD.MAX_LENGTH) {
      return `Input text must be ${VALIDATION.PAYLOAD.MAX_LENGTH} characters or less (currently ${input.length})`;
    }
    return null;
  }, [input]);

  const generateSimpleHash = async () => {
    if (!input) {
      toast.error("Please enter some text to hash");
      return;
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsProcessing(true);

    try {
      const params: HashLibParams = {
        algorithm: algorithm.toLowerCase() as HashLibAlgorithm,
        payload: input
      };
      
      const response = await createHashLibHash(params);
      onHashGenerated(response.hash);
      toast.success("Hash generated successfully");
    } catch (error) {
      console.error("Error generating hash:", error);
      toast.error(`Failed to generate hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Generate Hash</CardTitle>
        <CardDescription>
          Enter your text and choose an algorithm to generate a hash
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="text-input">Text to hash</Label>
            <span className="text-xs text-muted-foreground">
              {input.length}/{VALIDATION.PAYLOAD.MAX_LENGTH} characters
            </span>
          </div>
          <Input
            id="text-input"
            placeholder="Enter text to hash..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            className={`min-h-20 resize-y ${validationError ? 'border-destructive' : ''}`}
          />
          
          {validationError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="algorithm" className="mr-2">Hash Algorithm</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-medium">Hash Algorithms:</p>
                  <p className="text-sm mt-1">
                    <strong>MD5:</strong> Fast but weak. 128-bit hash value. Not recommended for security purposes due to vulnerabilities.
                  </p>
                  <p className="text-sm mt-1">
                    <strong>SHA-256:</strong> 256-bit hash, widely used. Good balance of security and performance.
                  </p>
                  <p className="text-sm mt-1">
                    <strong>SHA-384:</strong> 384-bit hash, stronger than SHA-256 but slower.
                  </p>
                  <p className="text-sm mt-1">
                    <strong>SHA-512:</strong> 512-bit hash, highest security in the SHA-2 family but requires more processing.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select 
            value={algorithm} 
            onValueChange={setAlgorithm as any}
          >
            <SelectTrigger id="algorithm">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sha256">SHA-256</SelectItem>
              <SelectItem value="sha384">SHA-384</SelectItem>
              <SelectItem value="sha512">SHA-512</SelectItem>
              <SelectItem value="md5">MD5 (Less secure)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={generateSimpleHash} 
          className="w-full"
          disabled={isProcessing || !input || !!validationError}
        >
          {isProcessing ? "Generating..." : "Generate Hash"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SimpleHashTab;
