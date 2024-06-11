import { Device, User, Measurement } from "./types";

const fetchWithToken = async (
  url: string,
  token: string,
  options: RequestInit
) => {
  console.log(`Bearer ${token}`);
  if (token !== "" && token !== undefined) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } else {
    return null;
  }
};

export const getUsers = async (token: string) => {
  const response = await fetchWithToken(
    "http://localhost:8080/users",
    token,
    {}
  );
  return response as User[];
};

export const createUser = async (user: User, token: string) => {
  const response = await fetchWithToken("http://localhost:8080/users", token, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  return response;
};

export const updateUser = async (user: User, token: string) => {
  const response = await fetchWithToken(
    `http://localhost:8080/users/${user?.UserID}`,
    token,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    }
  );
  return response;
};

export const deleteUser = async (id: string, token: string) => {
  const response = await fetchWithToken(
    `http://localhost:8080/users/${id}`,
    token,
    {
      method: "DELETE",
    }
  );
  return response;
};

// --------------

export const getDevices = async (token: string) => {
  const response = await fetchWithToken(
    "http://localhost:8081/devices",
    token,
    {}
  );
  return response as Device[];
};

export const createDevice = async (device: Device, token: string) => {
  const response = await fetchWithToken(
    "http://localhost:8081/devices",
    token,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(device),
    }
  );
  return response;
};

export const updateDevice = async (device: Device, token: string) => {
  const response = await fetchWithToken(
    `http://localhost:8081/devices/${device?.DeviceID}`,
    token,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(device),
    }
  );
  return response;
};

export const deleteDevice = async (id: string, token: string) => {
  const response = await fetchWithToken(
    `http://localhost:8081/devices/${id}`,
    token,
    {
      method: "DELETE",
    }
  );
  return response;
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
  console.log(data);
  return data;
};

// ---------------------

export const getMeasurements = async () => {
  const response = await fetch("http://localhost:8082/measurements");
  const data = await response.json();
  return data as Measurement[];
};
