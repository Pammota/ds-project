import Modal from "@/components/shared/Modal";
import {
  createDevice,
  deleteDevice,
  getMeasurements,
  updateDevice,
} from "@/fetchers";
import { Device, Measurement, User } from "@/types";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useDevicesStore,
  useStore,
  useUserStore,
  useUsersStore,
} from "@/stores";
import { Chart } from "../Chart";

type Props = {
  devices: Device[];
};

const DevicesTable = ({ devices }: Props) => {
  const router = useRouter();

  const userObject = useStore(useUserStore, (state) => state.userObject);
  const token = useStore(useUserStore, (state) => state.token);

  const [selectedDevice, setSelectedDevice] = useState<string>();
  const [modalOpen, setModalOpen] = useState(false);

  const [pageLoaded, setPageLoaded] = useState(false);

  const [isChecked, setIsChecked] = useState(false);

  const { fetchDevices } = useDevicesStore();

  const users = useStore(useUsersStore, (state) => state.users);
  const { fetchUsers } = useUsersStore();

  const [measurements, setMeasurements] = useState<Measurement[]>();
  const [showChart, setShowChart] = useState(false);
  const [interVal, setInterVal] = useState<NodeJS.Timeout>();

  const [newDevice, setNewDevice] = useState<Device>({
    DeviceID: "",
    DeviceName: "",
    UserID: "",
  });

  useEffect(() => {
    fetchUsers();
    getMeasurements().then((measurements) => {
      setMeasurements(measurements);
    });
    setPageLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pageLoaded && (!userObject || !token)) {
      router.push("/login");
    }
  }, [userObject, token, pageLoaded, router]);

  // const getDevice = (id: string | undefined) =>
  //   devices.filter((device) => device.DeviceID === id)[0];

  const getUserNameFromId = (id: string) =>
    users?.filter((user) => user.UserID === id)[0]?.Username;

  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <Modal isOpen={modalOpen}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedDevice) {
              updateDevice(newDevice);
              setModalOpen(false);
              setTimeout(() => {
                fetchDevices();
              }, 200);
            } else {
              createDevice({
                DeviceName: newDevice.DeviceName,
                UserID: newDevice.UserID,
              });
              setModalOpen(false);
              setTimeout(() => {
                fetchDevices();
              }, 200);
            }
          }}
        >
          <span className="text-2xl font-semibold">
            {selectedDevice ? "Edit Device" : "Create Device"}
          </span>
          {selectedDevice && (
            <div className="flex flex-col gap-4">
              <span className="text-xl font-semibold">Device ID</span>
              <input
                className="border-2 border-gray-400 rounded-md p-2 dark:bg-gray-600 dark:text-white"
                value={newDevice.DeviceID}
                required
                onChange={(e) => {
                  setNewDevice({ ...newDevice, DeviceID: e.target.value });
                }}
              />
            </div>
          )}
          <div className="flex flex-col gap-4">
            <span className="text-xl font-semibold">Device Name</span>
            <input
              className="border-2 border-gray-400 rounded-md p-2 dark:bg-gray-600 dark:text-white"
              value={newDevice.DeviceName}
              required
              onChange={(e) => {
                setNewDevice({ ...newDevice, DeviceName: e.target.value });
              }}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xl font-semibold">User</span>
            <select
              className="border-2 border-gray-400 rounded-md p-2 dark:bg-gray-600 dark:text-white"
              value={newDevice.UserID}
              onChange={(e) => {
                setNewDevice({ ...newDevice, UserID: e.target.value });
              }}
            >
              <option value="">Select a user</option>
              {users?.map((user: User) => (
                <option key={user.UserID} value={user.UserID}>
                  {user.Username}
                </option>
              ))}
            </select>
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
            {selectedDevice && (
              <button
                type="button"
                onClick={() => {
                  deleteDevice(selectedDevice ?? "");
                  setModalOpen(false);
                  setTimeout(() => {
                    fetchDevices();
                  }, 200);
                }}
                className="rounded-md px-4 py-2 bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            )}
            {selectedDevice && (
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setShowChart(true);
                  const intervalId = setInterval(() => {
                    getMeasurements().then((measurements) => {
                      setMeasurements(measurements);
                    });
                  }, 5000);
                  setInterVal(intervalId);
                }}
                className="rounded-md px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700 focus:outline-none"
              >
                Graph
              </button>
            )}
          </div>
        </form>
      </Modal>

      <Modal isOpen={showChart}>
        <div className="w-full h-full overflow-x-scroll flex flex-col gap-4">
          <Chart
            data={
              measurements?.filter(
                (measurement) => measurement.device_id === selectedDevice
              ) ?? []
            }
          />
          <button
            type="button"
            onClick={() => {
              setShowChart(false);
              clearInterval(interVal);
            }}
            className="rounded-md px-4 py-2 bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 focus:outline-none"
          >
            Close
          </button>
        </div>
      </Modal>

      {userObject?.Roles === "admin" && (
        <div className="flex gap-4">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
          <label>Only My Devices</label>
        </div>
      )}
      <table className="table-auto w-full border-2 border-gray-400 dark:border-gray-200 rounded-md">
        <thead>
          <tr className="uppercase text-sm leading-normal border-b-2 border-gray-400 dark:border-gray-200">
            <th className="py-3 px-6 text-left border-x-2 border-gray-400 dark:border-gray-200">
              Device ID
            </th>
            <th className="py-3 px-6 text-left border-x-2 border-gray-400 dark:border-gray-200">
              Device Name
            </th>
            <th className="py-3 px-6 text-left border-x-2 border-gray-400 dark:border-gray-200">
              User
            </th>
          </tr>
        </thead>
        <tbody className="text-sm font-light">
          {devices
            .filter(
              (device) =>
                (userObject?.Roles === "admin" && !isChecked) ||
                device.UserID === userObject?.UserID
            )
            .map((device) => (
              <tr
                key={device.DeviceID}
                className="border-b-2 border-gray-400 dark:border-gray-200 hover:bg-blue-300/30 select-none cursor-pointer"
                onClick={() => {
                  if (userObject?.Roles === "admin") {
                    setSelectedDevice(device.DeviceID);
                    setNewDevice(device);
                    setModalOpen(true);
                  }
                }}
              >
                <td className="py-3 px-6 text-left whitespace-nowrap border-x-2 border-gray-400 dark:border-gray-200">
                  {device.DeviceID}
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap border-x-2 border-gray-400 dark:border-gray-200">
                  {device.DeviceName}
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap border-x-2 border-gray-400 dark:border-gray-200">
                  {getUserNameFromId(device.UserID)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {userObject?.Roles === "admin" && (
        <button
          className="rounded-md px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none"
          onClick={() => {
            setSelectedDevice(undefined);
            setNewDevice({ DeviceID: "", DeviceName: "", UserID: "" });
            setModalOpen(true);
          }}
        >
          Create Device
        </button>
      )}
    </div>
  );
};

export default DevicesTable;
