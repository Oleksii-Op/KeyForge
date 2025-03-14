
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getRandomToken } from "@/services/apiService";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface RandomTokenGeneratorProps {
  onTokenGenerated: (token: string) => void;
}

const RandomTokenGenerator = ({ onTokenGenerated }: RandomTokenGeneratorProps) => {
  const [randomToken, setRandomToken] = useState("");
  const [isLoadingToken, setIsLoadingToken] = useState(false);

  const fetchRandomToken = async () => {
    setIsLoadingToken(true);
    
    try {
      const token = await getRandomToken();
      setRandomToken(token);
      onTokenGenerated(token);
      toast.success("Random token generated and applied");
    } catch (error) {
      console.error("Error fetching random token:", error);
      toast.error(`Failed to fetch random token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingToken(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Generate Random Token</CardTitle>
          <CardDescription>
            Generate a random token to use for hashing
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Input
            value={randomToken}
            readOnly
            placeholder="Click the button to generate a random token"
            className="flex-1"
          />
          <Button 
            onClick={fetchRandomToken} 
            disabled={isLoadingToken}
            className="whitespace-nowrap"
          >
            {isLoadingToken ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Generate Token"
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RandomTokenGenerator;
