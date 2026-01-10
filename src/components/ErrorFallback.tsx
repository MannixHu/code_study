interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
}

export default function ErrorFallback({
  error,
  resetError,
}: ErrorFallbackProps) {
  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto",
        marginTop: "100px",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>出错了</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        应用遇到了一个错误，请尝试刷新页面
      </p>

      {process.env.NODE_ENV !== "production" && (
        <details
          style={{
            marginTop: "20px",
            textAlign: "left",
            background: "#f5f5f5",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
            错误详情 (仅开发环境可见)
          </summary>
          <pre
            style={{
              marginTop: "12px",
              overflow: "auto",
              fontSize: "12px",
              color: "#d32f2f",
            }}
          >
            {error.message}
          </pre>
          <pre
            style={{
              marginTop: "8px",
              overflow: "auto",
              fontSize: "11px",
              color: "#666",
            }}
          >
            {error.stack}
          </pre>
        </details>
      )}

      <div
        style={{
          marginTop: "24px",
          display: "flex",
          gap: "12px",
          justifyContent: "center",
        }}
      >
        {resetError && (
          <button
            onClick={resetError}
            style={{
              padding: "8px 24px",
              fontSize: "14px",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            重试
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "8px 24px",
            fontSize: "14px",
            backgroundColor: "#f5f5f5",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          刷新页面
        </button>
      </div>
    </div>
  );
}
