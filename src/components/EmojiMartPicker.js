import { useCallback } from "react";
import EmojiPicker from "emoji-picker-react";

export default function EmojiPickerWrapper({ onEmojiSelect }) {
  const handleEmojiClick = useCallback(
    (emojiData) => {
      if (!emojiData) return;
      if (typeof onEmojiSelect === "function") {
        onEmojiSelect(emojiData.emoji);
      }
    },
    [onEmojiSelect]
  );

  return (
    <EmojiPicker
      onEmojiClick={handleEmojiClick}
      lazyLoadEmojis
      theme="light"
      searchPlaceHolder="Tìm emoji..."
      skinTonesDisabled={false}
      width="100%"
      height={350}
    />
  );
}
