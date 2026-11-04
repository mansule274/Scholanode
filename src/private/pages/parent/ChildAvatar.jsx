import { useState } from "react";
import { getDisplayName, getInitials } from "./childDisplay";

export default function ChildAvatar({ child, className = "" }) {
  const photoUrl = child?.profileImageUrl || "";

  // Signed storage links expire, so a stale one falls back to initials
  // instead of a broken image.
  const [failedUrl, setFailedUrl] = useState("");

  if (photoUrl && failedUrl !== photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`Profile photo of ${getDisplayName(child)}`}
        onError={() => setFailedUrl(photoUrl)}
        className={`shrink-0 object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center font-black ${className}`}
      aria-hidden="true"
    >
      {getInitials(child)}
    </div>
  );
}
