import { useEffect } from "react";
import { useAuth } from "../Authen/AuthContext";

const useNotificationSocket = (staffId) => {
  const { setHasNotification } = useAuth(); // ✅ dùng context

  useEffect(() => {
    if (!staffId) {
      console.warn("❗ Không có staffId để kết nối WebSocket.");
      return;
    }

    const wsUrl = `wss://reinir.mooo.com/ws/staff/${staffId}`;
    console.log("🔌 Đang kết nối WebSocket đến:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ WebSocket đã kết nối.");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Đã nhận từ WebSocket:", data);

        // ✅ Cập nhật trạng thái dot đỏ qua AuthContext
        setHasNotification(true);
        console.log("🔴 setHasNotification(true)");
      } catch (err) {
        console.error("❌ Lỗi parse JSON WebSocket:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket lỗi:", err);
    };

    ws.onclose = () => {
      console.warn("⚠️ WebSocket đóng kết nối.");
    };

    return () => {
      ws.close();
      console.log("🔌 WebSocket bị đóng khi component unmount.");
    };
  }, [staffId]);
};

export default useNotificationSocket;
