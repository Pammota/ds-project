export type User = {
  UserID?: string;
  FirstName: string;
  LastName: string;
  Username: string;
  Email: string;
  Roles: string;
};

export type ServerResponse = {
  Status: number;
  TextStatus: string;
};

export type Device = {
  DeviceID?: string;
  DeviceName: string;
  UserID: string;
};

export type Measurement = {
  measurement_id: string;
  device_id: string;
  timestamp: string;
  measurement_value: number;
};
