import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from "web-vitals";

interface StoredMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(
      `[Web Vitals] ${metric.name}:`,
      metric.value.toFixed(2),
      metric.rating,
    );
  }

  // Store in localStorage for analysis
  try {
    const vitals = JSON.parse(
      localStorage.getItem("web-vitals") || "[]",
    ) as StoredMetric[];
    vitals.push({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
    });
    // Keep only the last 100 metrics
    localStorage.setItem("web-vitals", JSON.stringify(vitals.slice(-100)));
  } catch (e) {
    console.error("Failed to store web vitals", e);
  }
}

/**
 * Initialize Web Vitals monitoring
 * Tracks: CLS, FID, LCP, FCP, TTFB
 */
export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

/**
 * Get stored Web Vitals metrics
 */
export function getStoredVitals(): StoredMetric[] {
  try {
    return JSON.parse(localStorage.getItem("web-vitals") || "[]");
  } catch {
    return [];
  }
}

/**
 * Clear stored Web Vitals metrics
 */
export function clearStoredVitals(): void {
  localStorage.removeItem("web-vitals");
}
