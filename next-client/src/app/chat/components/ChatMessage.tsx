import { MessageLeft } from "@/components/icons/MessageLeft";
import { MessageRight } from "@/components/icons/MessageRight";
import React from "react";

type Props = {
  children?: React.ReactNode;
  self?: boolean;
  typing?: boolean;
  seen?: boolean;
};

export const ChatMessage = ({ children, self, typing, seen }: Props) => {
  return (
    <>
      {!typing && (
        <>
          {!self && (
            <div className="flex drop-shadow-sm self-start w-full">
              <MessageLeft className="text-gray-200 opacity-60 text-shadow" />
              <div className="bg-gray-200/60  p-2.5 flex rounded-xl rounded-tl-none lg:max-w-1/3 md:max-w-2/5 sm:max-w-[60%] max-w-[80%]">
                <span className="text-black whitespace-normal break-words">
                  {children}
                </span>
                {seen && (
                  <></>
                )}
              </div>
            </div>
          )}
          {self && (
            <div className="flex drop-shadow-sm self-end w-full justify-end">
              <div className="bg-blue-400 p-2.5 text-white flex items-center gap-4 rounded-xl rounded-tr-none lg:max-w-1/3 md:max-w-2/5 sm:max-w-[60%] max-w-[80%] shadow">
                <span>{children}</span>
                {seen && (
                  <span className="text-sm opacity-60 text-white whitespace-normal break-words">
                    Seen
                  </span>
                )}
              </div>
              <MessageRight className="text-blue-400 text-shadow" />
            </div>
          )}
        </>
      )}
      {typing && (
        <div className="flex text-black drop-shadow-sm self-end w-full justify-start">
          <span>{children}</span>
        </div>
      )}
    </>
  );
};
