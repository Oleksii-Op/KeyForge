
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createBcryptHash } from "@/services/apiService";
import { VALIDATION } from "@/config/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BcryptHashTabProps {
  input: string;
  onInputChange: (value: string) => void;
  onHashGenerated: (hash: string) => void;
}

const BcryptHashTab = ({ input, onInputChange, onHashGenerated }: BcryptHashTabProps) => {
  const [bcryptRounds, setBcryptRounds] = useState(VALIDATION.BCRYPT.ROUNDS.DEFAULT);
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation for inputs
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (input.length > VALIDATION.PAYLOAD.MAX_LENGTH) {
      errors.push(`Input text must be ${VALIDATION.PAYLOAD.MAX_LENGTH} characters or less (currently ${input.length})`);
    }
    
    if (bcryptRounds < VALIDATION.BCRYPT.ROUNDS.MIN || bcryptRounds > VALIDATION.BCRYPT.ROUNDS.MAX) {
      errors.push(`Rounds must be between ${VALIDATION.BCRYPT.ROUNDS.MIN} and ${VALIDATION.BCRYPT.ROUNDS.MAX}`);
    }
    
    return errors;
  }, [input, bcryptRounds]);

  const generateBcryptHash = async () => {
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
      const response = await createBcryptHash({
        payload: input,
        rounds: bcryptRounds
      });
      
      onHashGenerated(response.hash);
      toast.success("Bcrypt hash generated successfully");
    } catch (error) {
      console.error("Error generating Bcrypt hash:", error);
      toast.error(`Failed to generate hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Generate Bcrypt Hash</CardTitle>
        <CardDescription>
          Bcrypt is a password hashing function designed to be slow and resistant to brute-force attacks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bcrypt-text-input">Text to hash</Label>
            <span className="text-xs text-muted-foreground">
              {input.length}/{VALIDATION.PAYLOAD.MAX_LENGTH} characters
            </span>
          </div>
          <Input
            id="bcrypt-text-input"
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
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="bcrypt-rounds" className="mr-2">
              Rounds ({VALIDATION.BCRYPT.ROUNDS.MIN}-{VALIDATION.BCRYPT.ROUNDS.MAX})
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-medium">Bcrypt Rounds:</p>
                  <p className="text-sm mt-1">
                    Controls the computational cost of the hash. Each increment 
                    doubles the required time. Values around 10-12 are common 
                    for most applications, while 14+ provides higher security 
                    for sensitive applications.
                  </p>
                  <p className="text-sm mt-1">
                    - {VALIDATION.BCRYPT.ROUNDS.MIN}-10: Faster, suitable for high-volume systems
                  </p>
                  <p className="text-sm mt-1">
                    - 12: Good balance (industry standard)
                  </p>
                  <p className="text-sm mt-1">
                    - 14+: High security, but significantly slower
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="bcrypt-rounds"
            type="number"
            min={VALIDATION.BCRYPT.ROUNDS.MIN}
            max={VALIDATION.BCRYPT.ROUNDS.MAX}
            value={bcryptRounds}
            onChange={(e) => setBcryptRounds(parseInt(e.target.value))}
            className={`${
              bcryptRounds < VALIDATION.BCRYPT.ROUNDS.MIN || 
              bcryptRounds > VALIDATION.BCRYPT.ROUNDS.MAX 
                ? 'border-destructive' 
                : ''
            }`}
          />
          <p className="text-xs text-muted-foreground">
            Higher rounds = more secure but slower hash generation
          </p>
        </div>
        
        {validationErrors.length > 0 && validationErrors.some(error => error.includes('Rounds')) && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {validationErrors.find(error => error.includes('Rounds'))}
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={generateBcryptHash} 
          className="w-full"
          disabled={isProcessing || !input || validationErrors.length > 0}
        >
          {isProcessing ? "Generating..." : "Generate Bcrypt Hash"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BcryptHashTab;
