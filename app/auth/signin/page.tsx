"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.ok) {
      router.push("/create");
    } else {
      alert("Ошибка входа");
    }
  };

  return (
    <div className="min-h-[calc(100vh-40px)] flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-4">Вход</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
