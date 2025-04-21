import instance from "./Customize-Axios";

export async function loginAdmin({ UserEmail, password }) {
  return instance.post("/api/auth/admin/login", {
    UserEmail,
    password,
  });
}
export function resetCustomerPassword({ attemptId, token, newPassword }) {
  return instance.post("/api/auth/customer/password-reset", {
    attemptId,
    token,
    newPassword,
  });
}

export async function changePasswordAdmin({staffId, oldPassword, newPassword}) {
	return instance.post("/api/auth/admin/change-password", {staffId, oldPassword,newPassword});
}
		