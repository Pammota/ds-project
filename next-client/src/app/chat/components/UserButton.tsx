import { UserCircleIcon } from "@heroicons/react/20/solid";
import React from "react";

type Props = {
  children?: React.ReactNode;
  chosen?: boolean;
  isAdmin?: boolean;
};

export const UserButton = ({ children, chosen, isAdmin }: Props) => {
  return (
    <button
      className={`w-full p-2 rounded-lg flex gap-1 hover:brightness-75 transition-all ${
        chosen ? "bg-blue-500 text-white" : "bg-white"
      }`}
    >
      {isAdmin && (
        <UserCircleIcon
          className={`w-6 ${chosen ? "text-green-300" : "text-green-600"}`}
        />
      )}
      {!isAdmin && (
        <UserCircleIcon
          className={`w-6 ${chosen ? "text-white" : "text-gray-400"}`}
        />
      )}
      <span className="hidden sm:inline font-medium">{children}</span>
    </button>
  );
};
