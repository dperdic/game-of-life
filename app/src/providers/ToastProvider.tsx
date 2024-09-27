"use client";

import { ReactNode } from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/ReactToastify.min.css";

export default function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover={true}
        theme="light"
        transition={Slide}
      />
    </>
  );
}
