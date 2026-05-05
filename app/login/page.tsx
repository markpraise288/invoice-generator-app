"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";

interface FormDataType {
  email: string;
  password: string;
  companyName?: string;
  address?: string;
  name?: string;
  phone?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const loginHandler = async (formData: FormDataType) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔥 important for cookies
        body: JSON.stringify({email: formData.email, password: formData.password}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Logged in successfully");

      // No need to store access token manually if using cookies
      // Backend should set HTTP-only cookies

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen">
      <AuthForm title="Login" submitRequest={loginHandler} />
    </div>
  );
}