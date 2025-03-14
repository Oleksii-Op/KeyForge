
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  to: string;
  delay?: number;
}

const FeatureCard = ({ title, description, icon, to, delay = 0 }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative group"
    >
      <Link 
        to={to}
        className="block p-6 sm:p-8 rounded-2xl glass-card hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1"
      >
        <div className="w-12 h-12 mb-6 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <div className="flex items-center text-primary font-medium">
          <span className="mr-2">Learn more</span>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FeatureCard;
