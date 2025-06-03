import { useEffect, useRef } from "react";
import { useAuth } from "../Authen/AuthContext";

const useNotificationSocket = (staffId, onMessage) => {
  const { setHasNotification } = useAuth();
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!staffId) {
     
      return;
    }

    const wsUrl = `wss://reinir.mooo.com/ws/staff/${staffId}`;
   

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
     
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
    

        // Gọi dot đỏ nếu có
        setHasNotification(true);

        // Gọi callback mới nhất
        if (typeof onMessageRef.current === "function") {
          onMessageRef.current(data);
        }
      } catch (err) {
       
      }
    };

    ws.onerror = (err) => {
     
    };

    ws.onclose = () => {
    
    };

    return () => {
      ws.close();
  
    };
  }, [staffId]);
};

export default useNotificationSocket;
