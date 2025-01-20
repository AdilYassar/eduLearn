/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../callService";

// Create the WebSocket context
const WSContext = createContext(null);

// Create the WSProvider component
export const WSProvider = ({ children }) => {
  const socket = useRef(null);

  // Initialize the WebSocket connection when the component mounts
  useEffect(() => {
    socket.current = io(SOCKET_URL, { transports: ["websocket"] });

    // Cleanup function to disconnect the socket
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, []);

  // Function to initialize the socket if not already initialized
  const initializeSocket = () => {
    if (!socket.current) {
      socket.current = io(SOCKET_URL, { transports: ["websocket"] });
    }
  };

  // Emit an event to the WebSocket server
  const emit = (event, data) => {
    if (socket.current) {
      socket.current.emit(event, data);
    }
  };

  // Listen for an event from the WebSocket server
  const on = (event, cb) => {
    if (socket.current) {
      socket.current.on(event, cb);
    }
  };

  // Stop listening for a specific event
  const off = (event, cb) => {
    if (socket.current) {
      socket.current.off(event, cb);
    }
  };

  // Remove all listeners for a specific event or all events
  const removeAllListeners = (event) => {
    if (socket.current) {
      if (event) {
        socket.current.removeAllListeners(event);
      } else {
        socket.current.removeAllListeners();
      }
    }
  };

  // Disconnect the WebSocket connection
  const disconnect = () => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
  };

  // Define the context value
  const socketService = {
    initializeSocket,
    emit,
    on,
    off,
    removeAllListeners,
    disconnect,
  };

  // Provide the context value to children
  return <WSContext.Provider value={socketService}>{children}</WSContext.Provider>;
};

// Hook to consume the WebSocket context
export const useWS = () => {
  const socketService = useContext(WSContext);
  if (!socketService) {
    throw new Error("useWS must be used within a WSProvider");
  }
  return socketService;
};
