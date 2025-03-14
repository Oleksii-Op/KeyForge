
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createArgon2Hash } from "@/services/apiService";
import { VALIDATION } from "@/config/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Argon2HashTabProps {
  input: string;
  onInputChange: (value: string) => void;
  onHashGenerated: (hash: string) => void;
}

const Argon2HashTab = ({ input, onInputChange, onHashGenerated }: Argon2HashTabProps) => {
  const [argon2Length, setArgon2Length] = useState(VALIDATION.ARGON2.LENGTH.DEFAULT);
  const [argon2MemoryCost, setArgon2MemoryCost] = useState(VALIDATION.ARGON2.MEMORY_COST.DEFAULT);
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation for inputs
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (input.length > VALIDATION.PAYLOAD.MAX_LENGTH) {
      errors.push(`Input text must be ${VALIDATION.PAYLOAD.MAX_LENGTH} characters or less (currently ${input.length})`);
    }
    
    if (argon2Length < VALIDATION.ARGON2.LENGTH.MIN || argon2Length > VALIDATION.ARGON2.LENGTH.MAX) {
      errors.push(`Hash length must be between ${VALIDATION.ARGON2.LENGTH.MIN} and ${VALIDATION.ARGON2.LENGTH.MAX}`);
    }
    
    if (argon2MemoryCost < VALIDATION.ARGON2.MEMORY_COST.MIN || argon2MemoryCost > VALIDATION.ARGON2.MEMORY_COST.MAX) {
      errors.push(`Memory cost must be between ${VALIDATION.ARGON2.MEMORY_COST.MIN} and ${VALIDATION.ARGON2.MEMORY_COST.MAX}`);
    }
    
    return errors;
  }, [input, argon2Length, argon2MemoryCost]);

  const generateArgon2Hash = async () => {
    if (!input) {
      toast.error("Please enter some text to hash");
      return;
    }

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await createArgon2Hash({
        payload: input,
        length: argon2Length,
        memory_cost: argon2MemoryCost
      });
      
      onHashGenerated(response.hash);
      toast.success("Argon2 hash generated successfully");
    } catch (error) {
      console.error("Error generating Argon2 hash:", error);
      toast.error(`Failed to generate hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Generate Argon2 Hash</CardTitle>
        <CardDescription>
          Argon2 is a key derivation function designed to be resistant to GPU cracking attacks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="argon2-text-input">Text to hash</Label>
            <span className="text-xs text-muted-foreground">
              {input.length}/{VALIDATION.PAYLOAD.MAX_LENGTH} characters
            </span>
          </div>
          <Input
            id="argon2-text-input"
            placeholder="Enter text to hash..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            className={`min-h-20 resize-y ${input.length > VALIDATION.PAYLOAD.MAX_LENGTH ? 'border-destructive' : ''}`}
          />
          
          {input.length > VALIDATION.PAYLOAD.MAX_LENGTH && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Input text exceeds the maximum length of {VALIDATION.PAYLOAD.MAX_LENGTH} characters.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="argon2-length" className="mr-2">
                Hash Length ({VALIDATION.ARGON2.LENGTH.MIN}-{VALIDATION.ARGON2.LENGTH.MAX})
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-medium">Argon2 Hash Length:</p>
                    <p className="text-sm mt-1">
                      Controls the output length of the hash in bytes ({VALIDATION.ARGON2.LENGTH.MIN}-{VALIDATION.ARGON2.LENGTH.MAX}). 
                      Larger values provide more security against brute force attacks 
                      but use more memory. For most applications, the default value of {VALIDATION.ARGON2.LENGTH.DEFAULT} 
                      provides excellent security.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="argon2-length"
              type="number"
              min={VALIDATION.ARGON2.LENGTH.MIN}
              max={VALIDATION.ARGON2.LENGTH.MAX}
              value={argon2Length}
              onChange={(e) => setArgon2Length(parseInt(e.target.value))}
              className={`${
                argon2Length < VALIDATION.ARGON2.LENGTH.MIN || 
                argon2Length > VALIDATION.ARGON2.LENGTH.MAX 
                  ? 'border-destructive' 
                  : ''
              }`}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="argon2-memory" className="mr-2">
                Memory Cost (≤ {VALIDATION.ARGON2.MEMORY_COST.MAX})
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-medium">Argon2 Memory Cost:</p>
                    <p className="text-sm mt-1">
                      Determines the amount of memory used during hash computation (in KiB). 
                      Higher values make the hash more resistant to GPU-based attacks 
                      but require more resources. The default value of {VALIDATION.ARGON2.MEMORY_COST.DEFAULT} (64MB) 
                      is suitable for most applications, while values of 131072 (128MB) 
                      or higher provide stronger security for critical applications.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="argon2-memory"
              type="number"
              min={VALIDATION.ARGON2.MEMORY_COST.MIN}
              max={VALIDATION.ARGON2.MEMORY_COST.MAX}
              value={argon2MemoryCost}
              onChange={(e) => setArgon2MemoryCost(parseInt(e.target.value))}
              className={`${
                argon2MemoryCost < VALIDATION.ARGON2.MEMORY_COST.MIN || 
                argon2MemoryCost > VALIDATION.ARGON2.MEMORY_COST.MAX 
                  ? 'border-destructive' 
                  : ''
              }`}
            />
          </div>
        </div>
        
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={generateArgon2Hash} 
          className="w-full"
          disabled={isProcessing || !input || validationErrors.length > 0}
        >
          {isProcessing ? "Generating..." : "Generate Argon2 Hash"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Argon2HashTab;
