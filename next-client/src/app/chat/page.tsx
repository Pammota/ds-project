"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./components/ChatMessage";
import { UserButton } from "./components/UserButton";
import { User } from "@/types";

import useWebSocket from "react-use-websocket";
import { useStore } from "zustand";
import {
  ClassicQueue,
  useChatStore,
  useUserStore,
  useUsersStore,
} from "@/stores";

export type Message = {
  messageID?: string;
  messageType: "chat" | "typing" | "seen";
  username: string;
  content: {
    message: string;
    typing?: boolean;
    seen?: boolean;
  };
  to: string;
};

export default function Page() {
  const [theyAreTyping, setTheyAreTyping] = useState<boolean>(false);

  const userObject = useStore(useUserStore, (state) => state.userObject);
  const users = useStore(useUsersStore, (state) => state.users);
  const { fetchUsers } = useUsersStore();

  const [updatedOldMessages, setUpdatedOldMessages] = useState<boolean>(false);
  const messageQueueListOld = useStore(
    useChatStore,
    (state) => state.messageQueueList
  );
  const { updateMessageQueue } = useChatStore();
  const [messageQueueOld, setMessageQueueOld] = useState<ClassicQueue | null>(
    null
  );
  const [updatedMQO, setUpdatedMQO] = useState<boolean>(false);

  const bottomMessage = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    bottomMessage.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    "ws://localhost:8090/ws"
  );

  const [inputField, setInputField] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User>();
  const [messageQueue, setMessageQueue] = useState<{
    [key: string]: Message[];
  }>({});

  useEffect(() => {
    scrollToBottom();
  }, [messageQueue]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (messageQueueListOld && userObject?.UserID && !updatedMQO) {
      setMessageQueueOld(messageQueueListOld[userObject?.UserID]);
    }
    setUpdatedMQO(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageQueueListOld, userObject?.UserID]);

  useEffect(() => {
    if (users && users.length > 0 && userObject && !updatedOldMessages && updatedMQO) {
      setSelectedUser(users[0]);
      console.log(messageQueueOld);
      if (messageQueueOld && Object.keys(messageQueueOld).length > 0) {
        let firstQueue: { [key: string]: Message[] } = {};
        users.forEach((user) => {
          if (user.UserID) {
            firstQueue[user.UserID] = [];
          }
        });

        setMessageQueue({ ...firstQueue, ...messageQueueOld });
        updateMessageQueue(
          { ...firstQueue, ...messageQueueOld },
          userObject.UserID ?? ""
        );
        setUpdatedOldMessages(true);
      } else {
        let firstQueue: { [key: string]: Message[] } = {};
        users.forEach((user) => {
          if (user.UserID) {
            firstQueue[user.UserID] = [];
          }
        });

        setMessageQueue({ ...firstQueue });
        updateMessageQueue({ ...firstQueue }, userObject.UserID ?? "");
        setUpdatedOldMessages(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageQueueOld, users, userObject]);

  useEffect(() => {
    sendJsonMessage({
      messageType: "chat",
      username: userObject?.UserID ?? "",
      content: {
        message: "-",
      },
      to: "-",
    });
  }, [sendJsonMessage, userObject?.UserID]);

  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage.messageType === "chat") {
        if (selectedUser?.UserID) {
          let newQueue = messageQueue;
          newQueue[lastJsonMessage.username]?.push(lastJsonMessage);
          setMessageQueue({ ...newQueue });
          updateMessageQueue({ ...newQueue }, userObject?.UserID ?? "");
        }
      }
      if (lastJsonMessage.messageType === "typing") {
        if (selectedUser?.UserID === lastJsonMessage.username) {
          setTheyAreTyping(true);
          scrollToBottom();
          setTimeout(() => {
            setTheyAreTyping(false);
          }, 2500);
        }
      }

      if (lastJsonMessage.messageType === "seen") {
        if (userObject?.UserID && selectedUser?.UserID) {
          let newQueue = messageQueue;
          newQueue[lastJsonMessage.username] = messageQueue[
            lastJsonMessage.username
          ].map((message) => {
            message.content.seen = true;

            return message;
          });
          setMessageQueue({ ...newQueue });
          updateMessageQueue({ ...newQueue }, userObject?.UserID ?? "");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  return (
    <main className="w-full h-screen">
      <div className=" flex pt-16 h-full">
        {/* User List START */}
        <div className="w-1/4 bg-gray-200 p-4">
          <ul className="space-y-2 text-black">
            {users?.length >  0 && users?.map((user: User, i) => (
              <>
                {user.UserID !== userObject?.UserID && (
                  <li
                    className="w-full"
                    key={i}
                    onClick={() => {
                      setSelectedUser(user);
                    }}
                  >
                    <UserButton
                     isAdmin={ 
                      user?.Roles === "admin"
                      } 
                     chosen={user.UserID === selectedUser?.UserID}>
                      {/* {messageQueue[user.UserID ?? ""]?.filter(
                        (message) => message.content.seen === undefined && 
                        message.username === user?.UserID
                      ).length !== 0 && (
                        <span className="text-sm text-white bg-red-500 rounded-full px-2 py-1 ml-2 mr-3"></span>
                      )} */}
                      {`${user.FirstName} ${user.LastName}`}
                    </UserButton>
                  </li>
                )}
              </>
            ))}
          </ul>
        </div>
        {/* Users List END */}

        {/* Chat */}
        <div className="flex flex-col gap-2 w-3/4 bg-gray-100 p-4">
          <span className="text-black font-semibold text-2xl px-4 py-2 bg-white rounded-lg">
            {`${selectedUser?.FirstName} ${selectedUser?.LastName}`}
          </span>
          <div className="bg-white p-4 rounded-xl h-full flex flex-col justify-between items-stretch">
            {/* Chat messages START*/}
            <div className="mb-4 flex flex-col gap-2 w-full max-h-[68vh] overflow-y-scroll">
              {messageQueue &&
                Object.keys(messageQueue).length !== 0 &&
                selectedUser?.UserID &&
                messageQueue[selectedUser.UserID].map((message, i) => (
                  <ChatMessage
                    self={message.username === userObject?.UserID ?? ""}
                    seen={message.content.seen}
                    key={i}
                  >
                    {message.content.message}
                  </ChatMessage>
                ))}
              {theyAreTyping && (
                <ChatMessage typing={true}>
                  {`${selectedUser?.FirstName} ${selectedUser?.LastName} is typing...`}
                </ChatMessage>
              )}
              <div className="h-4 scroll-p-[300px]" ref={bottomMessage} />
            </div>
            {/* Chat messages END */}

            {/* Chat input START */}
            <form
              className="flex gap-4 items-center"
              onSubmit={(e) => {
                e.preventDefault();
                if (inputField === "") return;
                sendJsonMessage({
                  messageType: "chat",
                  username: userObject?.UserID ?? "",
                  content: {
                    message: inputField,
                  },
                  to: selectedUser?.UserID,
                });

                let newQueue = messageQueue;
                if (selectedUser?.UserID) {
                  newQueue[selectedUser?.UserID].push({
                    messageType: "chat",
                    username: userObject?.UserID ?? "",
                    content: {
                      message: inputField,
                    },
                    to: selectedUser?.UserID,
                  });
                }
                setMessageQueue({ ...newQueue });
                updateMessageQueue({ ...newQueue }, userObject?.UserID ?? "");
                setInputField("");
              }}
            >
              <input
                type="text"
                className="border text-black border-gray-300 rounded-md p-2 w-full"
                placeholder="Type your message..."
                value={inputField}
                onChange={(e) => {
                  setInputField(e.target.value);
                  if (e.target.value !== "") {
                    sendJsonMessage({
                      messageType: "typing",
                      username: userObject?.UserID ?? "",
                      content: {
                        typing: true,
                      },
                      to: selectedUser?.UserID,
                    });

                    if (selectedUser?.UserID) {
                      sendJsonMessage({
                        messageType: "seen",
                        username: userObject?.UserID ?? "",
                        content: {
                          seen: true,
                        },
                        to: selectedUser.UserID,
                      });
                    }
                  }
                }}
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                Send
              </button>
            </form>
            {/* Chat input END */}
          </div>
        </div>
      </div>
    </main>
  );
}
