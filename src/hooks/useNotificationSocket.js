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
      console.warn("❗ Không có staffId để kết nối WebSocket.");
      return;
    }

    const wsUrl = `wss://reinir.mooo.com/ws/staff/${staffId}`;
    console.log("🔌 Kết nối WebSocket đến:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ WebSocket đã kết nối.");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Đã nhận từ WebSocket:", data);

        // Gọi dot đỏ nếu có
        setHasNotification(true);

        // Gọi callback mới nhất
        if (typeof onMessageRef.current === "function") {
          onMessageRef.current(data);
        }
      } catch (err) {
        console.error("❌ Lỗi parse WebSocket:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket lỗi:", err);
    };

    ws.onclose = () => {
      console.warn("⚠️ WebSocket đã đóng kết nối.");
    };

    return () => {
      ws.close();
      console.log("🔌 WebSocket đã ngắt khi component unmount.");
    };
  }, [staffId]);
};

export default useNotificationSocket;
