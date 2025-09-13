export function resolveAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;

  // Nếu đã là absolute URL (http/https) thì dùng luôn
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }

  // Nếu là relative path thì prepend S3 base URL
  const BASE_S3_URL = process.env.REACT_APP_S3_URL;
  return `${BASE_S3_URL.replace(/\/+$/, "")}/${avatarUrl.replace(/^\/+/, "")}`; // tránh // ở giữa
}
