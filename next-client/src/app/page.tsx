"use client";

import { useStore, useUserStore } from "@/stores";
import { BoltIcon } from "@heroicons/react/24/outline";

export default function Page() {
  const userObject = useStore(useUserStore, (state) => state.userObject);
  const token = useStore(useUserStore, (state) => state.token);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center pt-16 text-opacity-70">
      {token && userObject && (
        <div className="inline-flex gap-12 w-[60%] items-center">
          <div className="flex flex-col items-stretch justify-between gap-20 w-full h-full">
            <span className="font-medium text-4xl">
              Hi there! What would you like to do?
            </span>
            <div className="flex justify-start items-end h-full gap-6 w-full">
              <a
                href="/devices"
                className="px-4 py-2 bg-sky-400/80 text-white rounded-md hover:brightness-75 focus:scale-105 focus:outline-none duration-200"
              >
                See devices
              </a>
              {userObject.Roles === "admin" && (
                <a
                  href="/admin"
                  className="px-4 py-2 bg-emerald-400/80 text-white rounded-md hover:brightness-75 focus:scale-105 focus:outline-none duration-200"
                >
                  See users
                </a>
              )}
            </div>
          </div>
          <BoltIcon className="max-w-[40%] stroke-[1.1] stroke-yellow-300" />
        </div>
      )}

      {(!token || !userObject) && (
        <div className="inline-flex gap-12 w-[60%] items-center">
          <div className="flex flex-col items-stretch justify-between gap-20 w-full h-full">
            <span className="font-medium text-4xl">
              Hi there! Please log in!
            </span>
            <div className="flex justify-start items-end h-full gap-6 w-full">
              <a
                href="/login"
                className="px-4 py-2 bg-emerald-400/80 text-white rounded-md hover:brightness-75 focus:scale-105 focus:outline-none duration-200"
              >
                Log in
              </a>
            </div>
          </div>
          <BoltIcon className="max-w-[40%] stroke-[1.1] stroke-yellow-300" />
        </div>
      )}
    </main>
  );
}
