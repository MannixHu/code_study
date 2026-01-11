/**
 * HintButton Component
 * Button to request hints with level indicator
 */

import { Button, Tooltip, Badge } from "antd";
import { BulbOutlined, LoadingOutlined } from "@ant-design/icons";
import type { HintLevel } from "../types/hint";

interface HintButtonProps {
  onClick: () => void;
  isLoading: boolean;
  currentLevel: HintLevel;
  maxLevel: HintLevel;
  disabled?: boolean;
  hintsUsed: number;
}

export function HintButton({
  onClick,
  isLoading,
  currentLevel,
  maxLevel,
  disabled,
  hintsUsed,
}: HintButtonProps) {
  const isMaxLevel = currentLevel > maxLevel;
  const buttonDisabled = disabled || isLoading || isMaxLevel;

  const getTooltipText = () => {
    if (isMaxLevel) {
      return "已达到最大提示次数";
    }
    if (isLoading) {
      return "正在生成提示...";
    }
    return `获取提示 (级别 ${currentLevel}/${maxLevel})`;
  };

  const getLevelColor = (level: HintLevel): string => {
    const colors: Record<HintLevel, string> = {
      1: "#52c41a", // green - gentle hint
      2: "#faad14", // yellow - specific hint
      3: "#ff4d4f", // red - detailed hint
    };
    return colors[level] || "#1890ff";
  };

  return (
    <Tooltip title={getTooltipText()}>
      <Badge
        count={hintsUsed > 0 ? hintsUsed : 0}
        size="small"
        offset={[-5, 5]}
        style={{ backgroundColor: getLevelColor(currentLevel) }}
      >
        <Button
          type="default"
          size="middle"
          icon={isLoading ? <LoadingOutlined spin /> : <BulbOutlined />}
          onClick={onClick}
          disabled={buttonDisabled}
          style={{
            borderColor: isMaxLevel ? "#d9d9d9" : getLevelColor(currentLevel),
            color: isMaxLevel ? "#d9d9d9" : getLevelColor(currentLevel),
            height: 36,
            paddingInline: 14,
          }}
        >
          {isLoading ? "生成中..." : isMaxLevel ? "无更多提示" : "获取提示"}
        </Button>
      </Badge>
    </Tooltip>
  );
}
