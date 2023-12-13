import { Device, User, Measurement } from "./types";

export const getUsers = async () => {
  const response = await fetch("http://localhost:8080/users");
  const data = await response.json();
  return data as User[];
};

export const createUser = async (user: User) => {
  const response = await fetch("http://localhost:8080/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  return data;
};

export const updateUser = async (user: User) => {
  const response = await fetch(`http://localhost:8080/users/${user?.UserID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  return data;
};

export const deleteUser = async (id: string) => {
  const response = await fetch(`http://localhost:8080/users/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
};

// --------------

export const getDevices = async () => {
  const response = await fetch("http://localhost:8081/devices");
  const data = await response.json();
  return data as Device[];
};

export const createDevice = async (device: Device) => {
  const response = await fetch("http://localhost:8081/devices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(device),
  });
  const data = await response.json();
  return data;
};

export const updateDevice = async (device: Device) => {
  const response = await fetch(
    `http://localhost:8081/devices/${device?.DeviceID}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(device),
    }
  );
  const data = await response.json();
  return data;
};

export const deleteDevice = async (id: string) => {
  const response = await fetch(`http://localhost:8081/devices/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
};

export const loginUser = async (username: string, password: string) => {
  const response = await fetch("http://localhost:8080/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
  });

  const data = await response.json();
  return data;
};

// ---------------------

export const getMeasurements = async () => {
  const response = await fetch("http://localhost:8082/measurements");
  const data = await response.json();
  return data as Measurement[];
};
