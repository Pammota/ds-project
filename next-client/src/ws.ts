const createWS = () => {
  var ws = new WebSocket("ws://localhost:8090/ws");

  ws.onopen = function () {
    console.log("Connected to the WebSocket server");
  };

  ws.onmessage = function (event) {
    console.log("Received:", event.data);
  };

  ws.onclose = function () {
    console.log("WebSocket closed");
  };

  ws.onerror = function (error) {
    console.error("WebSocket Error:", error);
  };

  window.onunload = function () {
    ws.close();
  };

  return ws;
};

export const socket = createWS();