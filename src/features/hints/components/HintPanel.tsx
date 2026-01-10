/**
 * HintPanel Component
 * Displays hints with progressive reveal
 */

import { Card, Typography, Tag, Space, Timeline, Empty, Alert } from "antd";
import {
  BulbOutlined,
  RobotOutlined,
  BookOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { AIHint, HintLevel } from "../types/hint";

const { Text, Paragraph } = Typography;

interface HintPanelProps {
  currentHint: AIHint | null;
  hintHistory: AIHint[];
  error: string | null;
  isAIEnabled: boolean;
  onClose?: () => void;
}

const levelLabels: Record<HintLevel, { text: string; color: string }> = {
  1: { text: "温和提示", color: "green" },
  2: { text: "具体提示", color: "orange" },
  3: { text: "详细提示", color: "red" },
};

export function HintPanel({
  currentHint,
  hintHistory,
  error,
  isAIEnabled,
  onClose,
}: HintPanelProps) {
  if (error) {
    return (
      <Alert
        message="获取提示失败"
        description={error}
        type="error"
        showIcon
        closable
        onClose={onClose}
      />
    );
  }

  if (!currentHint && hintHistory.length === 0) {
    return (
      <Card
        size="small"
        title={
          <Space>
            <BulbOutlined />
            <span>提示</span>
          </Space>
        }
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description='点击"获取提示"按钮获取帮助'
        />
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title={
        <Space>
          <BulbOutlined />
          <span>提示历史</span>
          {isAIEnabled ? (
            <Tag icon={<RobotOutlined />} color="blue">
              AI
            </Tag>
          ) : (
            <Tag icon={<BookOutlined />} color="default">
              静态
            </Tag>
          )}
        </Space>
      }
      extra={
        onClose && (
          <CloseOutlined
            onClick={onClose}
            style={{ cursor: "pointer", color: "#999" }}
          />
        )
      }
      styles={{
        body: {
          maxHeight: 300,
          overflowY: "auto",
        },
      }}
    >
      <Timeline
        items={hintHistory.map((hint, index) => ({
          color: levelLabels[hint.level].color,
          children: (
            <div key={index}>
              <Space style={{ marginBottom: 8 }}>
                <Tag color={levelLabels[hint.level].color}>
                  {levelLabels[hint.level].text}
                </Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(hint.timestamp).toLocaleTimeString()}
                </Text>
              </Space>
              <Paragraph
                style={{
                  marginBottom: 0,
                  whiteSpace: "pre-wrap",
                  fontSize: 14,
                }}
              >
                {hint.content}
              </Paragraph>
              {hint.codeSnippet && (
                <pre
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: 8,
                    borderRadius: 4,
                    marginTop: 8,
                    fontSize: 12,
                    overflow: "auto",
                  }}
                >
                  {hint.codeSnippet}
                </pre>
              )}
            </div>
          ),
        }))}
      />
    </Card>
  );
}

/**
 * Compact hint display for inline use
 */
export function HintInline({ hint }: { hint: AIHint }) {
  return (
    <Alert
      message={
        <Space>
          <BulbOutlined />
          <Tag color={levelLabels[hint.level].color}>
            {levelLabels[hint.level].text}
          </Tag>
        </Space>
      }
      description={hint.content}
      type="info"
      showIcon={false}
      style={{ marginTop: 8 }}
    />
  );
}
