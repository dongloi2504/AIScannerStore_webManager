import instance from "./Customize-Axios";

export function sendNotificationToStore(storeId, content) {
  return instance.post("/ws/event/store/notif", {
    message: {
      type: "STORE_NOTIFICATION",
      sender: "STAFF",
      referenceId: storeId,
      message: content,
    },
    storeIds: [storeId],
  });
}