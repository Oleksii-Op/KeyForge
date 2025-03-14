
import { useState, useRef, ChangeEvent } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Upload, FileCheck, Copy, CheckCircle, File, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getFileChecksum, FileChecksumResponse } from "@/services/apiService";
import { HashLibAlgorithm } from "@/config/api";

const FileChecksum = () => {
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<HashLibAlgorithm>("sha256");
  const [checksum, setChecksum] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [compareValue, setCompareValue] = useState("");
  const [comparisonResult, setComparisonResult] = useState<boolean | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    filename: string;
    size: number;
    algorithm: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // File size validation (512 MiB = 536870912 bytes)
      if (selectedFile.size > 536870912) {
        toast.error("File is too large. Maximum size is 512 MiB");
        return;
      }
      
      setFile(selectedFile);
      setChecksum("");
      setComparisonResult(null);
      setError(null);
      setFileInfo(null);
    }
  };

  const calculateChecksum = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsCalculating(true);
    setChecksum("");
    setComparisonResult(null);
    setError(null);
    setFileInfo(null);

    try {
      const response: FileChecksumResponse = await getFileChecksum(file, algorithm);
      
      setChecksum(response.hash);
      setFileInfo({
        filename: response.filename,
        size: response.size,
        algorithm: response.algorithm,
      });
      
      // Check if we have a comparison value
      if (compareValue.trim()) {
        compareChecksums(response.hash);
      }
      
      toast.success("Checksum calculated successfully");
    } catch (error) {
      console.error("Error calculating checksum:", error);
      setError(error instanceof Error ? error.message : "Failed to calculate checksum");
      toast.error("Failed to calculate checksum");
    } finally {
      setIsCalculating(false);
    }
  };

  const compareChecksums = (calculatedChecksum: string) => {
    // Normalize both strings (remove spaces, convert to lowercase)
    const normalizedCalculated = calculatedChecksum.toLowerCase().replace(/\s+/g, '');
    const normalizedComparison = compareValue.toLowerCase().replace(/\s+/g, '');
    
    const result = normalizedCalculated === normalizedComparison;
    setComparisonResult(result);
    
    if (result) {
      toast.success("Checksums match!");
    } else {
      toast.error("Checksums do not match!");
    }
  };

  const copyToClipboard = () => {
    if (!checksum) return;
    
    navigator.clipboard.writeText(checksum);
    setIsCopied(true);
    toast.success("Checksum copied to clipboard");
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">File Checksum</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate and verify file checksums to ensure file integrity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Calculate File Checksum</CardTitle>
                <CardDescription>
                  Select a file and hash algorithm to generate a checksum
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center
                    transition-all duration-300 cursor-pointer
                    ${file ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-primary/5'}
                  `}
                  onClick={triggerFileInput}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  
                  <div className="flex flex-col items-center space-y-2">
                    {file ? (
                      <>
                        <FileCheck className="h-10 w-10 text-primary mb-2" />
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type || "Unknown type"}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="font-medium">Click to select a file or drag and drop</p>
                        <p className="text-sm text-muted-foreground">
                          Any file type, up to 512 MiB
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hash-algorithm">Hash Algorithm</Label>
                  <Select 
                    value={algorithm} 
                    onValueChange={(value: HashLibAlgorithm) => setAlgorithm(value)}
                    disabled={isCalculating}
                  >
                    <SelectTrigger id="hash-algorithm">
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
                  onClick={calculateChecksum} 
                  className="w-full"
                  disabled={!file || isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Calculate Checksum"
                  )}
                </Button>
                
                {error && (
                  <div className="p-4 bg-destructive/10 rounded-md text-destructive">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="font-medium">Error:</span>
                    </div>
                    <p className="mt-1">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {checksum && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Checksum Result</CardTitle>
                  <CardDescription>
                    {fileInfo?.algorithm.toUpperCase()} checksum for {fileInfo?.filename} ({formatFileSize(fileInfo?.size || 0)})
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <div className="p-4 bg-muted rounded-md overflow-x-auto font-mono text-sm break-all">
                      {checksum}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={copyToClipboard}
                    >
                      {isCopied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy to clipboard</span>
                    </Button>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <Label htmlFor="compare-checksum">Verify against known checksum (optional)</Label>
                    <Input
                      id="compare-checksum"
                      placeholder="Paste a checksum to compare..."
                      value={compareValue}
                      onChange={(e) => setCompareValue(e.target.value)}
                    />
                    
                    <Button 
                      onClick={() => compareChecksums(checksum)}
                      variant="outline"
                      className="w-full"
                      disabled={!compareValue.trim()}
                    >
                      Verify Checksum
                    </Button>
                    
                    {comparisonResult !== null && (
                      <div className={`p-3 rounded-md mt-2 ${comparisonResult ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                        {comparisonResult ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span>Checksums match! File integrity verified.</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <File className="h-4 w-4 mr-2" />
                            <span>Checksums do not match. File may be corrupted or different.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default FileChecksum;
