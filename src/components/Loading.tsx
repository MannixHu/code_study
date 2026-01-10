import { Spin } from "antd";

interface LoadingProps {
  message?: string;
  size?: "small" | "default" | "large";
}

export default function Loading({
  message = "加载中...",
  size = "large",
}: LoadingProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "16px",
      }}
    >
      <Spin size={size} />
      {message && <span style={{ color: "#666" }}>{message}</span>}
    </div>
  );
}
