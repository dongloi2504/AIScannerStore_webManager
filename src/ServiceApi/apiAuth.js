import instance from "./Customize-Axios";

export async function loginAdmin({ UserEmail, password }) {
  // Gửi POST request đến /api/auth/admin/login
  // (nối vào baseURL = process.env.REACT_APP_API)
  return instance.post("/api/auth/admin/login", {
    UserEmail,
    password,
  });
}