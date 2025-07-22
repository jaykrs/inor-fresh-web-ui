"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const route = useRouter();

  const handleSignin = async () => {
    if (!userName || !password) {
      alert("Please enter your User Name and Password");
      return;
    }

    try {
      const res = await fetch("https://api.edoctry.com/api/auth/local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: userName,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Login failed. Please try again.");
      }

      console.log("Response:", data);
      alert("Sign in successfully!");
      route.push('/admin');
      // Optional: Store token or redirect
    } catch (err: any) {
      console.error("Login error:", err);
      alert(err.message || "Something went wrong");
    }
  };

  return (
    <div>
        <p>Welcome Student...!!!</p>
    </div>
  );
}