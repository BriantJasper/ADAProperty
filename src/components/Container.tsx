import type { ReactNode } from "react";gid

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div className={`max-w-8xl mx-auto px-4 sm:px-4 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
