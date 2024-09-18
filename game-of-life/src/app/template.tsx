"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Main from "@/components/Main";
import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
  );
}
