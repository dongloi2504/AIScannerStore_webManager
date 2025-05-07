import instance from "./Customize-Axios";
import { downloadFile } from "./downloadFile";

export function getDevices({
  pageNumber = 0,
  pageSize,
  sortBy,
  isDescending = true,
  deviceCode,
  storeCode,
  storeName,
  isSuspended,
} = {}) {
  const query = {
    pageNumber,
    pageSize,
    sortBy,
    isDescending,
    deviceCode,
    storeCode,
    storeName,
	isSuspended
  };
   return instance.get("/api/pos", { params: query });
}

  export function registerDevice({ deviceCode, storeId, overwrite }) {
    return instance.post("/api/pos/register", {
      deviceCode,
      storeId,
      overwrite
    });
  }
  
  export function registerAndDownloadFile({ deviceCode, storeId, overwrite }) {
  instance.post("/api/pos/register", {
      deviceCode,
      storeId,
      overwrite
    }, { responseType: 'text' })
    .then((response) => {
      downloadFile(response, deviceCode + ".json", "application/json");
    })
    .catch((error) => {
      alert("Download failed:" + error);
    });
}
  
  export function suspendDevices({ deviceIds }) {
	const payload = {
	  deviceIds: Array.isArray(deviceIds) ? deviceIds : [deviceIds],
	};
	return instance.post("/api/pos/suspend", payload);  
  }