import React, { useEffect, useState } from "react";

import { User } from "@/types";
import { useDevicesStore, useStore, useUsersStore } from "@/stores";
import Modal from "@/components/shared/Modal";
import { createUser, deleteUser, updateDevice, updateUser } from "@/fetchers";

type Props = {
  users: User[];
};

const thClasses =
  "py-3 px-6 text-left border-x-2 border-gray-400 dark:border-gray-200";

const UsersTable = ({ users }: Props) => {
  const { fetchUsers } = useUsersStore();

  const [selectedUser, setSelectedUser] = useState<string>();
  const [modalOpen, setModalOpen] = useState(false);

  const devices = useStore(useDevicesStore, (state) => state.devices);
  const { fetchDevices } = useDevicesStore();

  const [newUser, setNewUser] = useState<User>({
    UserID: "",
    FirstName: "",
    LastName: "",
    Username: "",
    Email: "",
    Password: "",
    Roles: "",
  });

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <Modal isOpen={modalOpen}>
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedUser) {
              updateUser(newUser);
              setModalOpen(false);
              setTimeout(() => {
                fetchUsers();
              }, 200);
            } else {
              let userNew = { ...newUser };
              delete userNew.UserID;
              createUser(userNew);
              setModalOpen(false);
              setTimeout(() => {
                fetchUsers();
              }, 200);
            }
          }}
        >
          <span className="text-2xl font-semibold">
            {selectedUser ? "Edit User" : "Create User"}
          </span>
          <div className="flex flex-col gap-2">
            <span className="text-xl font-semibold">First name</span>
            <input
              className="border-2 border-gray-400 rounded-md p-1.5 dark:bg-gray-600 dark:text-white"
              value={newUser.FirstName}
              required
              onChange={(e) => {
                setNewUser({ ...newUser, FirstName: e.target.value });
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xl font-semibold">Last name</span>
            <input
              className="border-2 border-gray-400 rounded-md p-1.5 dark:bg-gray-600 dark:text-white"
              value={newUser.LastName}
              required
              onChange={(e) => {
                setNewUser({ ...newUser, LastName: e.target.value });
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xl font-semibold">Username</span>
            <input
              className="border-2 border-gray-400 rounded-md p-1.5 dark:bg-gray-600 dark:text-white"
              value={newUser.Username}
              required
              onChange={(e) => {
                setNewUser({ ...newUser, Username: e.target.value });
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xl font-semibold">Email</span>
            <input
              className="border-2 border-gray-400 rounded-md p-1.5 dark:bg-gray-600 dark:text-white"
              value={newUser.Email}
              required
              onChange={(e) => {
                setNewUser({ ...newUser, Email: e.target.value });
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xl font-semibold">Password</span>
            <input
              className="border-2 border-gray-400 rounded-md p-1.5 dark:bg-gray-600 dark:text-white"
              value={newUser.Password}
              required
              onChange={(e) => {
                setNewUser({ ...newUser, Password: e.target.value });
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xl font-semibold">Roles</span>
            <input
              className="border-2 border-gray-400 rounded-md p-1.5 dark:bg-gray-600 dark:text-white"
              value={newUser.Roles}
              required
              onChange={(e) => {
                setNewUser({ ...newUser, Roles: e.target.value });
              }}
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-md px-4 py-2 bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none"
            >
              Save
            </button>
            {selectedUser && (
              <button
                type="button"
                onClick={() => {
                  deleteUser(selectedUser ?? "");
                  const userDevices = devices?.filter(
                    (device) => device.UserID === selectedUser
                  );
                  userDevices?.forEach((device) => {
                    updateDevice({ ...device, UserID: "" });
                  });
                  setModalOpen(false);
                  setTimeout(() => {
                    fetchUsers();
                  }, 200);
                }}
                className="rounded-md px-4 py-2 text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </Modal>
      <table className="table-auto w-full border-2 border-gray-400 dark:border-gray-200 rounded-md">
        <thead>
          <tr className="uppercase text-sm leading-normal border-b-2 border-gray-400 dark:border-gray-200">
            <th className={thClasses}>First Name</th>
            <th className={thClasses}>Last Name</th>
            <th className={thClasses}>Username</th>
            <th className={thClasses}>Email</th>
            <th className={thClasses}>Roles</th>
          </tr>
        </thead>
        <tbody className="text-sm font-light">
          {users.map((user) => (
            <tr
              key={user.Username}
              className="border-b-2 border-gray-400 dark:border-gray-200 hover:bg-blue-300/30 select-none cursor-pointer"
              onClick={() => {
                setSelectedUser(user?.UserID);
                setNewUser(user);
                setModalOpen(true);
              }}
            >
              <td className="py-3 px-6 text-left whitespace-nowrap border-x-2 border-gray-400 dark:border-gray-200">
                {user.FirstName}
              </td>
              <td className="py-3 px-6 text-left whitespace-nowrap border-x-2 border-gray-400 dark:border-gray-200">
                {user.LastName}
              </td>
              <td className="py-3 px-6 text-left whitespace-nowrap border-x-2 border-gray-400 dark:border-gray-200">
                {user.Username}
              </td>
              <td className="py-3 px-6 text-left border-x-2 border-gray-400 dark:border-gray-200">
                {user.Email}
              </td>
              <td className="py-3 px-6 text-left border-x-2 border-gray-400 dark:border-gray-200 capitalize">
                {user.Roles}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="rounded-md px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none"
        onClick={() => {
          setSelectedUser(undefined);
          setNewUser({
            UserID: "",
            FirstName: "",
            LastName: "",
            Username: "",
            Email: "",
            Password: "",
            Roles: "",
          });
          setModalOpen(true);
        }}
      >
        Create User
      </button>
    </div>
  );
};

export default UsersTable;
