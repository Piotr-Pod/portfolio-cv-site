```tsx
// Wzorzec komponentu (Client)
"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useReducedMotion, motion } from "framer-motion";

type Props = { label: string; onClick?: () => void; className?: string };

export function CtaButton({ label, onClick, className }: Props) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 4 }}
      animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
    >
      <Button
        className={cn("focus-visible:ring-2 focus-visible:ring-offset-2", className)}
        onClick={onClick}
        aria-label={label}
      >
        {label}
      </Button>
    </motion.div>
  );
}
```
