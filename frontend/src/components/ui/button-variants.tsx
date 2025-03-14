
import { Button } from "@/components/ui/button";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const GlassButton = ({
  variant = "default",
  size = "default",
  className,
  ...props
}: GlassButtonProps) => {
  return (
    <Button
      className={cn(
        "backdrop-blur-md transition-all duration-300",
        {
          "bg-white/10 hover:bg-white/20 border border-white/20": variant === "default",
          "bg-primary/80 hover:bg-primary border border-primary/20": variant === "primary",
          "bg-secondary/80 hover:bg-secondary border border-secondary/20": variant === "secondary",
          "bg-transparent hover:bg-white/10 border border-white/20": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
};
