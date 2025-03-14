
import { motion } from "framer-motion";

interface KeyGenerationErrorProps {
  error: string | null;
}

const KeyGenerationError = ({ error }: KeyGenerationErrorProps) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 bg-destructive/10 rounded-md text-destructive mt-4">
        <p className="font-medium">Error generating key:</p>
        <p>{error}</p>
      </div>
    </motion.div>
  );
};

export default KeyGenerationError;
