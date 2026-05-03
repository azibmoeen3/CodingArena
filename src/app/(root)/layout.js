import { Navbar } from "@/components/Navbar";
import React from "react";
import Providers from "@/components/Providers";

const layout = ({ children }) => {
  return (
    <Providers>
      <>
        <Navbar />
        {children}
      </>
    </Providers>
  );
};

export default layout;
