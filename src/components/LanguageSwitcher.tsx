/**
 * Language Switcher Component
 * Allows users to switch between supported languages
 */

import { useTranslation } from "react-i18next";
import { Select } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { getSupportedLanguages } from "../i18n";

const { Option } = Select;

interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
  size?: "small" | "middle" | "large";
}

export function LanguageSwitcher({
  className,
  showIcon = true,
  size = "small",
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const languages = getSupportedLanguages();

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select
      value={i18n.language.split("-")[0]} // Handle cases like "zh-CN"
      onChange={handleChange}
      className={className}
      size={size}
      style={{ minWidth: 100 }}
      suffixIcon={showIcon ? <GlobalOutlined /> : undefined}
      aria-label="Select language"
    >
      {languages.map((lang) => (
        <Option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </Option>
      ))}
    </Select>
  );
}

/**
 * Compact Language Switcher
 * Shows only language code, useful for header/toolbar
 */
export function CompactLanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const languages = getSupportedLanguages();
  const currentLang = i18n.language.split("-")[0];

  const handleToggle = () => {
    const currentIndex = languages.findIndex((l) => l.code === currentLang);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex].code);
  };

  return (
    <button
      onClick={handleToggle}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 8px",
        border: "1px solid #d9d9d9",
        borderRadius: "4px",
        background: "transparent",
        cursor: "pointer",
        fontSize: "14px",
      }}
      aria-label={`Current language: ${languages.find((l) => l.code === currentLang)?.nativeName}. Click to switch.`}
    >
      <GlobalOutlined />
      <span>{currentLang.toUpperCase()}</span>
    </button>
  );
}

export default LanguageSwitcher;
