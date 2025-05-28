import instance from "./Customize-Axios";
export function getStoreDashboardReport(storeId) {
  return instance.get(`/api/report/dashboard/store/${storeId}`);
}