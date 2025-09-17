import React, { useState } from 'react';
import { Select, Row, Col, Card, Typography } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const scaleValues = [2, 4, 6, 8, 10, 12, 14, 16];

const RadiusVisualizer = () => {
  const [innerRadius, setInnerRadius] = useState(4);
  const [containerSpacing, setContainerSpacing] = useState(4);

  const containerRadius = innerRadius + containerSpacing;

  const containerStyle = {
    borderRadius: containerRadius,
    padding: containerSpacing,
    background: '#f0f2f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    width: 200,
    transition: 'all 0.3s ease',
  };

  const innerStyle = {
    borderRadius: innerRadius,
    background: '#1890ff',
    height: '100%',
    width: '100%',
    transition: 'all 0.3s ease',
  };

  const isBroken = containerRadius < innerRadius;

  return (
    <Card style={{ maxWidth: 400, margin: 'auto' }}>
      <Title level={4}>Border Radius Visualizer</Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Text>Inner Radius:</Text>
          <Select
            value={innerRadius}
            onChange={setInnerRadius}
            style={{ width: '100%' }}
          >
            {scaleValues.map((val) => (
              <Option key={val} value={val}>
                {val}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={12}>
          <Text>Container Spacing:</Text>
          <Select
            value={containerSpacing}
            onChange={setContainerSpacing}
            style={{ width: '100%' }}
          >
            {scaleValues.map((val) => (
              <Option key={val} value={val}>
                {val}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Text strong>Container Radius: {containerRadius}px</Text>
        {isBroken && (
          <Text type="danger" style={{ display: 'block' }}>
            ⚠️ Rule broken: containerRadius - innerRadius
          </Text>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={containerStyle}>
          <div style={innerStyle}></div>
        </div>
      </div>
    </Card>
  );
};

export default RadiusVisualizer;
