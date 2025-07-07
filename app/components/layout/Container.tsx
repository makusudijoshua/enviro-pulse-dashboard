import React from "react";

interface ContainerProps {
  className?: string;
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`mx-auto w-full max-w-screen-xl px-6 sm:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
