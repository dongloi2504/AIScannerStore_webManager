import instance from "./Customize-Axios";

export async function loginAdmin({ UserEmail, password }) {
  return instance.post("/api/auth/admin/login", {
    UserEmail,
    password,
  });
}