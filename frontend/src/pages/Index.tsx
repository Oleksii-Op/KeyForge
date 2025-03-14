
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FeatureCard from "@/components/FeatureCard";
import { motion } from "framer-motion";
import { Key, Hash, FileCheck } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <Hero />
      
      <section id="features" className="py-20">
        <div className="container">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-medium text-primary">Tools & Features</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Cryptographic tools for every need</h2>
            <p className="text-muted-foreground">Powerful and easy-to-use tools designed with security and simplicity in mind.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              title="Hash Generation"
              description="Generate secure hashes using various algorithms including SHA-256, SHA-512, MD5, and more."
              icon={<Hash className="h-6 w-6" />}
              to="/hash-generation"
              delay={1}
            />
            
            <FeatureCard
              title="Key Generation"
              description="Create secure cryptographic keys for various applications, including RSA and ECC keys."
              icon={<Key className="h-6 w-6" />}
              to="/key-generation"
              delay={2}
            />
            
            <FeatureCard
              title="File Checksum"
              description="Verify file integrity by generating and comparing checksums for your files."
              icon={<FileCheck className="h-6 w-6" />}
              to="/file-checksum"
              delay={3}
            />
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-2xl glass-panel text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Security & Privacy Focused</h2>
              <p className="text-lg mb-6 text-muted-foreground">
                While our application utilizes external servers for cryptographic processing, 
                we maintain a strict no-data-collection policy. Your inputs are processed and 
                immediately discarded after the result is returned to your browser.
              </p>
              <p className="text-lg mb-6 text-muted-foreground">
                We do not track, store, or analyze your data. All cryptographic operations 
                are processed with ephemeral sessions that leave no trace once completed.
              </p>
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Strict no-data-collection • Ephemeral processing • Privacy first
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
