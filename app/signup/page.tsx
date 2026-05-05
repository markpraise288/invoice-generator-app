"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";

interface FormDataType {
  email: string;
  password: string;
  name?: string;
  companyName?: string;
  address?: string;
  phone?: string;
}

export default function SignupPage() {
  const router = useRouter();

  const signupHandler = async (formData: FormDataType) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          address: formData.address,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      console.log("Account created successfully");

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen">
      <AuthForm title="Signup" submitRequest={signupHandler} />
    </div>
  );
}