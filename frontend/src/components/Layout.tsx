
import { ReactNode, useEffect } from "react";
import Navigation from "./Navigation";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <motion.main
        className="flex-grow"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        key={location.pathname}
      >
        {children}
      </motion.main>
      <footer className="py-6 border-t border-border/30 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} KeyForge. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
