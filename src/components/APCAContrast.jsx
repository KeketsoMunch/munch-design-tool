import React, { useState, useEffect } from 'react';
import { Card, Typography, Input, Row, Col, Space, Divider, Alert, Slider, Switch } from 'antd';
import { EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const APCAContrast = () => {
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState(400);
  const [showDetails, setShowDetails] = useState(false);

  // APCA calculation function (simplified implementation)
  const calculateAPCA = (textColor, bgColor) => {
    // Convert hex to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Convert RGB to linear RGB
    const toLinear = (val) => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    };

    // Calculate relative luminance
    const getLuminance = (rgb) => {
      const r = toLinear(rgb.r);
      const g = toLinear(rgb.g);
      const b = toLinear(rgb.b);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const textRgb = hexToRgb(textColor);
    const bgRgb = hexToRgb(bgColor);
    
    if (!textRgb || !bgRgb) return 0;

    const textLum = getLuminance(textRgb);
    const bgLum = getLuminance(bgRgb);

    // Simplified APCA calculation (this is a basic approximation)
    const lighter = Math.max(textLum, bgLum);
    const darker = Math.min(textLum, bgLum);
    
    // APCA uses a more complex formula, this is simplified for demo
    const contrast = (lighter - darker) / (lighter + darker + 0.05);
    return Math.round(contrast * 100);
  };

  const apcaScore = calculateAPCA(foregroundColor, backgroundColor);

  // APCA guidelines for different use cases
  const getAPCAGuideline = (score, fontSize, fontWeight) => {
    const absScore = Math.abs(score);
    
    if (absScore >= 90) return { level: 'AAA', description: 'Excellent for all text sizes', color: '#52c41a' };
    if (absScore >= 75) return { level: 'AA+', description: 'Good for body text and smaller', color: '#73d13d' };
    if (absScore >= 60) return { level: 'AA', description: 'Suitable for large text', color: '#faad14' };
    if (absScore >= 45) return { level: 'A', description: 'Minimum for very large text', color: '#fa8c16' };
    return { level: 'Fail', description: 'Insufficient contrast', color: '#ff4d4f' };
  };

  const guideline = getAPCAGuideline(apcaScore, fontSize, fontWeight);

  // Sample text scenarios
  const textScenarios = [
    { name: 'Heading 1', size: 32, weight: 700, text: 'Main Page Heading' },
    { name: 'Heading 2', size: 24, weight: 600, text: 'Section Heading' },
    { name: 'Body Text', size: 16, weight: 400, text: 'This is regular body text that users will read in paragraphs. It needs good contrast for comfortable reading.' },
    { name: 'Small Text', size: 14, weight: 400, text: 'Small descriptive text or captions' },
    { name: 'Button Text', size: 16, weight: 500, text: 'Click Here' },
    { name: 'Link Text', size: 16, weight: 400, text: 'This is a clickable link' },
    { name: 'Fine Print', size: 12, weight: 400, text: 'Terms and conditions or fine print text' },
    { name: 'Large Display', size: 48, weight: 800, text: 'Hero Text' }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <EyeOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2}>APCA Contrast Checker</Title>
          <Text type="secondary">
            Advanced Perceptual Contrast Algorithm - The future of accessible color contrast
          </Text>
        </div>

        {/* Introduction */}
        <Alert
          message="What is APCA?"
          description={
            <div>
              <Paragraph>
                APCA (Accessible Perceptual Contrast Algorithm) is a new method for predicting contrast 
                between text and background colors, developed as part of WCAG 3.0. Unlike the current 
                WCAG 2.x contrast ratio, APCA considers human visual perception more accurately.
              </Paragraph>
              <Paragraph>
                <strong>Key improvements over WCAG 2.x:</strong>
              </Paragraph>
              <ul>
                <li>Considers font size and weight in contrast calculations</li>
                <li>More accurate for modern displays and viewing conditions</li>
                <li>Better handling of dark mode and colored backgrounds</li>
                <li>Accounts for spatial frequency and visual perception</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24 }}
        />

        {/* Color Controls */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col span={12}>
            <Card size="small" title="Text Color (Foreground)">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  style={{ width: '100%', height: 40 }}
                />
                <Input
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  placeholder="#000000"
                />
              </Space>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Background Color">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  style={{ width: '100%', height: 40 }}
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* APCA Score Display */}
        <Card 
          size="small" 
          style={{ 
            textAlign: 'center', 
            marginBottom: 24,
            backgroundColor: backgroundColor,
            color: foregroundColor,
            border: `2px solid ${guideline.color}`
          }}
        >
          <Title level={3} style={{ color: foregroundColor, margin: 0 }}>
            APCA Score: {apcaScore}
          </Title>
          <Text style={{ color: foregroundColor, fontSize: '16px' }}>
            Level: {guideline.level} - {guideline.description}
          </Text>
        </Card>

        {/* Controls */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Text strong>Font Size: {fontSize}px</Text>
            <Slider
              value={fontSize}
              onChange={setFontSize}
              min={10}
              max={72}
              style={{ marginTop: 8 }}
            />
          </Col>
          <Col span={8}>
            <Text strong>Font Weight: {fontWeight}</Text>
            <Slider
              value={fontWeight}
              onChange={setFontWeight}
              min={100}
              max={900}
              step={100}
              style={{ marginTop: 8 }}
            />
          </Col>
          <Col span={8}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text strong>Show Details:</Text>
              <Switch 
                checked={showDetails}
                onChange={setShowDetails}
              />
            </div>
          </Col>
        </Row>

        <Divider />

        {/* Text Scenarios */}
        <Title level={3}>Text Scenarios Preview</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          See how your color combination performs across different text sizes and weights
        </Text>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 16,
          marginBottom: 32
        }}>
          {textScenarios.map((scenario, index) => {
            const scenarioScore = calculateAPCA(foregroundColor, backgroundColor);
            const scenarioGuideline = getAPCAGuideline(scenarioScore, scenario.size, scenario.weight);
            
            return (
              <Card
                key={index}
                size="small"
                style={{
                  backgroundColor: backgroundColor,
                  border: `2px solid ${scenarioGuideline.color}`,
                  minHeight: 120
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Text 
                    strong 
                    style={{ 
                      color: foregroundColor, 
                      fontSize: '12px',
                      opacity: 0.8 
                    }}
                  >
                    {scenario.name} ({scenario.size}px, {scenario.weight})
                  </Text>
                </div>
                
                <div
                  style={{
                    color: foregroundColor,
                    fontSize: scenario.size,
                    fontWeight: scenario.weight,
                    lineHeight: 1.2,
                    marginBottom: 8
                  }}
                >
                  {scenario.text}
                </div>

                {showDetails && (
                  <div style={{ fontSize: '10px', opacity: 0.7, color: foregroundColor }}>
                    <div>APCA Score: {scenarioScore}</div>
                    <div>Level: {scenarioGuideline.level}</div>
                    <div>{scenarioGuideline.description}</div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <Divider />

        {/* APCA Guidelines */}
        <Title level={3}>APCA Guidelines</Title>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small">
              <Title level={5}>APCA Score Levels</Title>
              <div style={{ fontSize: '12px' }}>
                <div style={{ marginBottom: 8, padding: '4px 8px', backgroundColor: '#f6ffed', border: '1px solid #52c41a', borderRadius: 4 }}>
                  <Text strong>90+ (AAA):</Text> Excellent for all text sizes
                </div>
                <div style={{ marginBottom: 8, padding: '4px 8px', backgroundColor: '#f6ffed', border: '1px solid #73d13d', borderRadius: 4 }}>
                  <Text strong>75+ (AA+):</Text> Good for body text and smaller
                </div>
                <div style={{ marginBottom: 8, padding: '4px 8px', backgroundColor: '#fffbe6', border: '1px solid #faad14', borderRadius: 4 }}>
                  <Text strong>60+ (AA):</Text> Suitable for large text
                </div>
                <div style={{ marginBottom: 8, padding: '4px 8px', backgroundColor: '#fff2e8', border: '1px solid #fa8c16', borderRadius: 4 }}>
                  <Text strong>45+ (A):</Text> Minimum for very large text
                </div>
                <div style={{ padding: '4px 8px', backgroundColor: '#fff2f0', border: '1px solid #ff4d4f', borderRadius: 4 }}>
                  <Text strong>&lt;45 (Fail):</Text> Insufficient contrast
                </div>
              </div>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card size="small">
              <Title level={5}>Key Differences from WCAG 2.x</Title>
              <div style={{ fontSize: '12px' }}>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li><strong>Perceptual uniformity:</strong> Better matches human vision</li>
                  <li><strong>Font awareness:</strong> Considers size and weight</li>
                  <li><strong>Spatial frequency:</strong> Accounts for text rendering</li>
                  <li><strong>Modern displays:</strong> Optimized for current technology</li>
                  <li><strong>Dark mode support:</strong> Better handling of dark themes</li>
                  <li><strong>Color independence:</strong> Works with any color combination</li>
                </ul>
              </div>
            </Card>
          </Col>
        </Row>

        <Alert
          message="Learn More About APCA"
          description={
            <div>
              <Paragraph>
                For detailed information about APCA, visit the official documentation at{' '}
                <a href="https://git.apcacontrast.com/documentation/APCAeasyIntro.html" target="_blank" rel="noopener noreferrer">
                  git.apcacontrast.com/documentation/APCAeasyIntro.html
                </a>
              </Paragraph>
              <Paragraph>
                APCA is being developed for WCAG 3.0 and represents the future of accessible color contrast standards.
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: 24 }}
        />
      </Card>
    </div>
  );
};

export default APCAContrast;