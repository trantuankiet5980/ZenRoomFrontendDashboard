import { useMemo, useState } from "react";
import { resolveAssetUrl } from "../utils/cdn";

export default function S3Image({ src, alt = "", className = "", cacheKey }) {
  const [err, setErr] = useState(false);
  const url = useMemo(() => {
    const u = resolveAssetUrl(src);
    return cacheKey ? `${u}${u.includes("?") ? "&" : "?"}v=${cacheKey}` : u;
  }, [src, cacheKey]);

  if (!src) return null;

  return err ? (
    <div
      className={`grid place-items-center bg-slate-100 text-slate-400 border ${className}`}
      title="Ảnh lỗi (xem console)"
    >
      IMG
    </div>
  ) : (
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => { console.warn("IMG LOAD ERROR:", { raw: src, resolved: url }); setErr(true); }}
      onLoad={() => { /* console.log("IMG OK:", url); */ }}
    />
  );
}
