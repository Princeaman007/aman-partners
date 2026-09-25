import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
      }}
    >
      <svg width="112" height="112" viewBox="0 0 48 48" fill="none">
        <path
          d="M8 42 L24 6 L40 42"
          stroke="#fafafa"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="30" r="4" fill="#fafafa" />
      </svg>
    </div>,
    size,
  );
}
