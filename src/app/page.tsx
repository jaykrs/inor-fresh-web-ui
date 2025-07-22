import SignInForm from "@/components/auth/SignInForm";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
   <SignInForm/>
  );
}
