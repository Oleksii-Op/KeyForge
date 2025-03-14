
import { useState } from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { HashLibAlgorithm } from "@/config/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RandomTokenGenerator from "@/components/hash/RandomTokenGenerator";
import SimpleHashTab from "@/components/hash/SimpleHashTab";
import Argon2HashTab from "@/components/hash/Argon2HashTab";
import BcryptHashTab from "@/components/hash/BcryptHashTab";
import HashResult from "@/components/hash/HashResult";

const HashGeneration = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [activeTab, setActiveTab] = useState("simple");
  const [algorithm, setAlgorithm] = useState<HashLibAlgorithm>("sha256");
  
  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleTokenGenerated = (token: string) => {
    setInput(token);
  };

  const handleHashGenerated = (hash: string) => {
    setResult(hash);
  };

  const handleAlgorithmChange = (algo: HashLibAlgorithm) => {
    setAlgorithm(algo);
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Hash Generation</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate secure cryptographic hashes from any text input using 
              industry-standard algorithms.
            </p>
          </motion.div>

          <RandomTokenGenerator onTokenGenerated={handleTokenGenerated} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="simple">Simple Hash</TabsTrigger>
                <TabsTrigger value="argon2">Argon2</TabsTrigger>
                <TabsTrigger value="bcrypt">Bcrypt</TabsTrigger>
              </TabsList>

              <TabsContent value="simple">
                <SimpleHashTab 
                  input={input} 
                  onInputChange={handleInputChange}
                  onHashGenerated={handleHashGenerated}
                />
              </TabsContent>

              <TabsContent value="argon2">
                <Argon2HashTab 
                  input={input} 
                  onInputChange={handleInputChange}
                  onHashGenerated={handleHashGenerated}
                />
              </TabsContent>

              <TabsContent value="bcrypt">
                <BcryptHashTab 
                  input={input} 
                  onInputChange={handleInputChange}
                  onHashGenerated={handleHashGenerated}
                />
              </TabsContent>
            </Tabs>
          </motion.div>

          <HashResult 
            result={result} 
            activeTab={activeTab} 
            algorithm={algorithm} 
          />
        </div>
      </section>
    </Layout>
  );
};

export default HashGeneration;
