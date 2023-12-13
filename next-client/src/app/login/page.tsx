"use client";

import { useUserStore } from "@/stores";
import { useEffect, useState } from "react";
import { useStore } from "zustand";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const token = useStore(useUserStore, (state) => state.token);
  const response = useStore(useUserStore, (state) => state.response);
  const { login } = useUserStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState<string>();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(username, password);
  };

  useEffect(() => {
    if(response?.status === 400) {
      setErrorMessage(response.textStatus);
    }

    if(response?.status === 200) {
      setErrorMessage(undefined);
      if(token) {
        router.push("/");
      }
    }
  }, [response, router, token]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-16 pt-16 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 p-6 rounded-md bg-gray-100 dark:bg-gray-800"
      >
        <label htmlFor="username" className="text-lg font-medium">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-4 py-2 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
        />
        <label htmlFor="password" className="text-lg font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
        />
        {errorMessage && <span className="text-red-500">* {" "}{errorMessage}</span>}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Login
        </button>
      </form>
    </main>
  );
}
