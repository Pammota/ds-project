"use client";

import Link from "next/link";
import {
  HomeIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  UserCircleIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { useStore, useUserStore } from "@/stores";

const Navbar = () => {
  const token = useStore(useUserStore, (state) => state.token);
  const userObject = useStore(useUserStore, (state) => state.userObject);
  const { removeToken, removeUserObject } = useUserStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 text-white w-screen bg-sky-500 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="relative flex items-center justify-between h-16">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-white hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Heroicon name: menu */}
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Heroicon name: x */}
              <svg
                className="hidden h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 text-center">
              <Link className="flex justify-center items-center gap-2" href="/">
                <RectangleGroupIcon className="w-10 h-10" />
                <span className="text-white font-bold text-xl">
                  Device Manager
                </span>
              </Link>
            </div>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4 translate-y-1">
                <Link
                  href="/"
                  className="hover:bg-white/40 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  <HomeIcon className="h-5 w-5 inline-block mr-1 -mt-1" />
                  Home
                </Link>
                {userObject?.Roles === "admin" && (
                  <Link
                    href="/admin"
                    className="hover:bg-white/40 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <CogIcon className="h-5 w-5 inline-block mr-1 -mt-1" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/devices"
                  className="hover:bg-white/40 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  <DevicePhoneMobileIcon className="h-5 w-5 inline-block mr-1 -mt-1" />
                  Devices
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <button
                  className="flex hover:bg-white/40 text-sm rounded-full focus:outline-none focus:ring-white"
                  id="user-menu"
                  aria-haspopup="true"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <UserCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <div
                className={
                  "origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5" +
                  (menuOpen ? "" : " hidden")
                }
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                {(!token || !userObject) && (
                  <a
                    href="/login"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Login
                  </a>
                )}

                {token && userObject && (
                  <a
                    href="/login"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => {
                      removeToken();
                      removeUserObject();
                    }}
                  >
                    Sign out
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className="sm:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <a
            href="#"
            className="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium"
          >
            Dashboard
          </a>

          <a
            href="#"
            className="hover:bg-white/40 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
          >
            Team
          </a>

          <a
            href="#"
            className="hover:bg-white/40 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
          >
            Projects
          </a>

          <a
            href="#"
            className="hover:bg-white/40 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
          >
            Calendar
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
