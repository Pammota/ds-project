import WebSocket from "ws";

const startup = (username) => {
  let socket = new WebSocket("ws://localhost:8090/ws");

  socket.on("open", function (e) {
    let data = {
      messageType: "chat",
      username,
      content: {
        message: "-",
      },
      to: "-",
    };

    let json = JSON.stringify(data);

    socket.send(json);
  });

  socket.on("message", (message) => {
    message = JSON.parse(message);
    if (message.messageType === "chat") {
      console.log(
        `\r\x1b[K${message.username}: ${message.content.message}\nYou: `
      );
    } else if (message.messageType === "typing") {
      if (message.content.typing) {
        console.log(`\r\x1b[K${message.username}: is typing\nYou: `);
      }
       else {
        console.log(`\r\x1b[K${message.username}: is not typing\nYou: `);
      }
    } else if (message.messageType === "seen") {
      console.log(`\r\x1b[K${message.username}: has seen the message\nYou: `);
    }
    process.stdout.moveCursor(5, -1);
  });

  socket.on("close", function (code, reason) {
    console.log("[close] Connection closed", code, reason);
    process.stdin.pause();
    process.exit(0);
  });

  return socket;
};

let promptCount: number = 0;
let username: string = "";
let sender: string = "";
promptCount++;
process.stdout.write("Username: ");

let socket: WebSocket;

for await (const line of process.stdin) {
  if (line.toString().trim() === "seen") {
    socket.send(
      JSON.stringify({
        messageType: "seen",
        username: username,
        content: {
          seen: true,
        },
        to: sender,
      })
    );
    process.stdout.write("You: ");
  } else if (line.toString().trim() === "no typing") {
    socket.send(
      JSON.stringify({
        messageType: "typing",
        username: username,
        content: {
          typing: false,
        },
        to: sender,
      })
    );
    process.stdout.write("You: ");
  } else if (line.toString().trim() === "typing") {
    socket.send(
      JSON.stringify({
        messageType: "typing",
        username: username,
        content: {
          typing: true,
        },
        to: sender,
      })
    );
    process.stdout.write("You: ");
  } else if (line.toString().trim() === "exit") {
    socket.close();
    process.exit(0);
  } else {
    if (promptCount === 1) {
      username = line.toString().trim();
      socket = startup(username);
      console.log(`Username set to: ${line}`);
      process.stdout.write("Sender: ");
    }
    if (promptCount === 2) {
      sender = line.toString().trim();
      console.log(`Sender set to: ${line}`);
      console.log(`\n-------Chat-------\n`);
      process.stdout.write("You: ");
    }

    if (promptCount > 2) {
      let message = await line;
      process.stdout.write("You: ");
      socket.send(
        JSON.stringify({
          messageType: "chat",
          username: username,
          content: {
            message: message.toString().trim(),
          },
          to: sender,
        })
      );
    }

    promptCount++;
  }
}
