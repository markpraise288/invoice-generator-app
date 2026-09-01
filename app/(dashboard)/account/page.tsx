"use client";

import { useEffect, useState } from "react";
import { Pencil, Shield, Bell, CreditCard, Trash2 } from "lucide-react";
import AccountForm from "@/components/user/AccountForm";
import UserForm from "@/components/user/UserForm";
import { apiFetch } from "@/lib/apiFetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/accountCard";
import { useRouter } from "next/navigation";

interface User {
  _id?: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  subscription: {
    plan: string;
    status: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const [userData, setUserData] = useState<User>({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    subscription: {
      plan: "",
      status: "",
    },
  });

  // 🔹 Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch("/users");
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  // 🔹 Open edit modal
  const openEdit = () => {
    if (!user) return;
    setUserData(user);
    setIsEditing(true);
  };

  // 🔹 Handle input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔥 Update user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiFetch(`/users`, {
        method: "PATCH",
        body: JSON.stringify(userData),
      });

      setUser(userData); // instant UI update
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-gray-500">
            Manage your profile, security and preferences
          </p>
        </div>

        <Button 
                  onClick={openEdit} 
                  className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <Pencil size={16} />
                  Edit Profile
                </Button>
      </div>

      {/* PROFILE CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {user.name?.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1">
            <AccountForm user={user} />
          </div>
        </CardContent>
      </Card>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center">
          <UserForm
            handleSubmit={handleSubmit}
            setIsEditing={setIsEditing}
            handleChange={handleChange}
            userData={userData}
          />
        </div>
      )}
    </div>
  );
}