"use client";
import DevicesTable from "@/components/featured/DevicesTable";
import { useDevicesStore, useStore } from "@/stores";
import { useEffect } from "react";

export default function Page() {
  const devices = useStore(useDevicesStore, (state) => state.devices);
  const { fetchDevices } = useDevicesStore();

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-16 pt-16">
      <span className="text-5xl font-semibold pt-10">Devices</span>
      <div className=" max-w-[70%]">
        <DevicesTable devices={devices ?? []} />
      </div>
    </main>
  );
}
