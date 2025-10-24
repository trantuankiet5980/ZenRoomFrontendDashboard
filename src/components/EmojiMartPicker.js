import { useEffect, useMemo, useState } from "react";

function resolvePicker() {
  if (typeof window === "undefined") return null;
  return window.EmojiMart?.Picker || null;
}

export default function EmojiMartPicker({ onEmojiSelect }) {
  const [PickerComponent, setPickerComponent] = useState(() => resolvePicker());
  const [error, setError] = useState(false);

  useEffect(() => {
    if (PickerComponent) return undefined;
    if (typeof window === "undefined") return undefined;

    const existing = resolvePicker();
    if (existing) {
      setPickerComponent(() => existing);
      return undefined;
    }

    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      const picker = resolvePicker();
      if (picker) {
        setPickerComponent(() => picker);
        window.clearInterval(interval);
      } else if (attempts > 40) {
        setError(true);
        window.clearInterval(interval);
      }
    }, 150);

    return () => {
      window.clearInterval(interval);
    };
  }, [PickerComponent]);

  const pickerProps = useMemo(
    () => ({
      onSelect: (emoji) => {
        if (typeof onEmojiSelect === "function") {
          onEmojiSelect(emoji);
        }
      },
      title: "Chọn emoji",
      emoji: "sparkles",
      color: "#f59f0b",
      showPreview: false,
      showSkinTones: true,
      style: { width: "100%" },
      set: "apple",
    }),
    [onEmojiSelect]
  );

  if (error) {
    return (
      <div className="text-xs text-red-500">
        Không thể tải emoji picker. Vui lòng kiểm tra kết nối mạng.
      </div>
    );
  }

  if (!PickerComponent) {
    return (
      <div className="px-3 py-4 text-center text-xs text-slate-500">
        Đang tải emoji…
      </div>
    );
  }

  return <PickerComponent {...pickerProps} />;
}