import { toast } from "react-toastify";

export function showToast(type = "info", message) {
  switch (type) {
    case "success":
      return toast.success(message);
    case "error":
      return toast.error(message);
    case "warning":
      return toast.warning(message);
    case "info":
    default:
      return toast.info(message);
  }
}
