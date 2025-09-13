function isAbs(u) {
  return typeof u === "string" && /^https?:\/\//i.test(u.trim());
}
function getBase() {
  const env = (process.env.REACT_APP_S3_URL || "").trim();
  const base = env || "https://kltn2025kiettoan.s3.ap-southeast-2.amazonaws.com";
  return base.replace(/\/+$/, ""); // cắt / cuối
}
function buildUrl(path) {
  if (!path) return "";
  const raw = String(path).trim();
  if (isAbs(raw)) return raw;                     // absolute: dùng luôn
  const key = raw.replace(/^\/+/, "");            // bỏ / đầu
  return `${getBase()}/${encodeURI(key)}`;        // encode an toàn
}

// Dùng chung cho avatar/media
export function resolveAvatarUrl(path) { return buildUrl(path); }
export function resolveAssetUrl(path)  { return buildUrl(path); }
