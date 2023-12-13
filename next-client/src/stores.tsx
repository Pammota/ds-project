import { create } from "zustand";
import { Device } from "./types";
import { User } from "./types";
import { useEffect, useState } from "react";
import { createJSONStorage, persist } from "zustand/middleware";
import { getDevices, getUsers, loginUser } from "./fetchers";

export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};

// Devices store
type DevicesStore = {
  devices: Device[];
  updateDevices: (devices: Device[]) => void;
  fetchDevices: () => void;
};

export const useDevicesStore = create<DevicesStore>((set) => ({
  devices: [],
  updateDevices: (devices) => set({ devices }),
  fetchDevices: () => {
    getDevices().then((data) => {
      set({ devices: data });
    });
  },
}));

// Users store
type UsersStore = {
  users: User[];
  updateUsers: (users: User[]) => void;
  fetchUsers: () => void;
};

export const useUsersStore = create<UsersStore>((set) => ({
  users: [],
  updateUsers: (users) => set({ users }),
  fetchUsers: () => {
    getUsers().then((data) => {
      set({ users: data });
    });
  },
}));

// Logged user store
type LoggedUserStore = {
  token: string | null;
  response: { status: number; textStatus: string } | null;
  userObject: User | null;
  updateToken: (newToken: string) => void;
  removeToken: () => void;
  updateUserObject: (newUserObject: User | null) => void;
  removeUserObject: () => void;
  login: (username: string, password: string) => void;
};

export const useUserStore = create<LoggedUserStore>()(
  persist(
    (set) => ({
      token: null,
      response: null,
      updateToken: (newToken) => set({ token: newToken }),
      removeToken: () => set({ token: null }),
      userObject: null,
      updateUserObject: (newUserObject) => set({ userObject: newUserObject }),
      login: (username, password) => {
        loginUser(username, password).then((resp) => {
          const response = { status: resp.status, textStatus: resp.textStatus };
          if (resp.status === 200) {
            set({
              token: resp.data.token,
              userObject: resp.data.user,
              response: response,
            });
          } else {
            set({ response: response });
          }
        });
      },
      removeUserObject: () => set({ userObject: null }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
