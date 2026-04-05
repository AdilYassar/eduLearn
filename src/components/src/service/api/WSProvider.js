import { createContext, useContext, useEffect, useRef } from "react"
import {SOCKET_URL} from '../config'
import { io } from "socket.io-client";
const WSContext = createContext(undefined);



// Create the WSProvider component
export const WSProvider = ({ children }) => {
  const socket = useRef();

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
  const off = (event) => {
    if (socket.current) {
      socket.current.off(event);
    }
  };

  const removeListener = listerName =>{
    socket?.current?.removeListener(listerName);
  }

  // Disconnect the WebSocket connection
  const disconnect = () => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current = undefined;
    }
  };

  // Define the context value
  const socketService = {
    initializeSocket:()=>{},
    emit,
    on,
    off,
    removeListener,
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
