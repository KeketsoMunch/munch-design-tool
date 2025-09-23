import React, { useState } from 'react';
import { Card, Typography, Upload, Button, Space, Divider, Row, Col, message, Alert } from 'antd';
import { UploadOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import flatTokens from '../data/system-studio-semantics-flat.json';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const DesignTokens = () => {
  const [tokens, setTokens] = useState(flatTokens);
  const [loading, setLoading] = useState(false);

  // Load default tokens from flat JSON
  const loadDefaultTokens = () => {
    setTokens(flatTokens);
    message.success('Default design tokens loaded!');
  };

  const handleFileUpload = (file) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setTokens(jsonData);
        message.success('Design tokens loaded successfully!');
      } catch (error) {
        message.error('Invalid JSON file. Please check the format.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    return false; // Prevent default upload behavior
  };

  // Parse token structure from flat tokens
  const parseTokenStructure = (flatTokens) => {
    const structure = {
      bg: {},
      fg: {},
      border: {},
      colours: {}
    };

    Object.keys(flatTokens).forEach(key => {
      if (key.startsWith('--system-bg-')) {
        const path = key.replace('--system-bg-', '').split('-');
        setNestedValue(structure.bg, path, { key, value: flatTokens[key] });
      } else if (key.startsWith('--system-fg-')) {
        const path = key.replace('--system-fg-', '').split('-');
        setNestedValue(structure.fg, path, { key, value: flatTokens[key] });
      } else if (key.startsWith('--system-border-')) {
        const path = key.replace('--system-border-', '').split('-');
        setNestedValue(structure.border, path, { key, value: flatTokens[key] });
      } else if (key.startsWith('--system-colours-')) {
        const path = key.replace('--system-colours-', '').split('-');
        setNestedValue(structure.colours, path, { key, value: flatTokens[key] });
      }
    });

    return structure;
  };

  const setNestedValue = (obj, path, value) => {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    current[path[path.length - 1]] = value;
  };

  // Find corresponding tokens for a given background token
  const findCorrespondingTokens = (bgPath, structure) => {
    // For "on" tokens, we need to find the specific "on" variant
    const onPath = ['on', ...bgPath];
    const fgOnToken = getTokenByPath(structure.fg, onPath);
    
    // For regular fg tokens, use the same path as bg
    const fgToken = getTokenByPath(structure.fg, bgPath);
    
    // For border tokens, use the same path as bg
    const borderToken = getTokenByPath(structure.border, bgPath);

    return {
      fg: fgOnToken || fgToken,
      border: borderToken
    };
  };

  const getTokenByPath = (obj, path) => {
    let current = obj;
    for (const segment of path) {
      if (current && current[segment]) {
        current = current[segment];
      } else {
        return null;
      }
    }
    return current && current.key ? current : null;
  };

  // Create token cards with proper relationships
  const createTokenCard = (bgToken, bgPath, correspondingTokens, pathString) => {
    const bgColor = bgToken.value;
    const fgColor = correspondingTokens.fg ? correspondingTokens.fg.value : '#000000';
    const borderColor = correspondingTokens.border ? correspondingTokens.border.value : '#d9d9d9';

    // Determine if we should use light or dark text based on background
    const shouldUseLightText = isColorDark(bgColor);
    const textColor = shouldUseLightText ? '#ffffff' : fgColor;

    return (
      <Card
        key={pathString}
        size="small"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          border: `2px solid ${borderColor}`,
          minHeight: 120,
          margin: '8px',
          minWidth: 200,
          maxWidth: 250
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          {pathString}
        </div>
        
        <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px' }}>
          <strong>BG:</strong> {bgToken.key}
        </div>
        <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '4px' }}>
          {bgColor}
        </div>
        
        {correspondingTokens.fg && (
          <>
            <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px' }}>
              <strong>FG:</strong> {correspondingTokens.fg.key}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '4px' }}>
              {correspondingTokens.fg.value}
            </div>
          </>
        )}
        
        {correspondingTokens.border && (
          <>
            <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px' }}>
              <strong>Border:</strong> {correspondingTokens.border.key}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              {correspondingTokens.border.value}
            </div>
          </>
        )}
      </Card>
    );
  };

  // Helper function to determine if a color is dark
  const isColorDark = (hexColor) => {
    if (!hexColor || !hexColor.startsWith('#')) return false;
    
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  // Render token cards recursively
  const renderTokenCards = (obj, path = [], structure) => {
    const cards = [];

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = [...path, key];
      const pathString = currentPath.join(' / ');

      if (value && value.key && value.value) {
        // This is a token with a value - create a card
        const correspondingTokens = findCorrespondingTokens(currentPath, structure);
        cards.push(createTokenCard(value, currentPath, correspondingTokens, pathString));
      } else if (typeof value === 'object' && value !== null) {
        // Recurse into nested objects
        cards.push(...renderTokenCards(value, currentPath, structure));
      }
    });

    return cards;
  };

  // Render special combination cards
  const renderSpecialCombinations = (structure) => {
    const combinations = [];

    // Primary combination
    const bgPrimary = getTokenByPath(structure.bg, ['primary']);
    const fgPrimary = getTokenByPath(structure.fg, ['primary']);
    const borderPrimary = getTokenByPath(structure.border, ['primary']);

    if (bgPrimary && fgPrimary) {
      combinations.push(
        <Card
          key="primary-combination"
          size="small"
          style={{
            backgroundColor: bgPrimary.value,
            color: fgPrimary.value,
            border: `2px solid ${borderPrimary ? borderPrimary.value : '#d9d9d9'}`,
            minHeight: 120,
            margin: '8px',
            minWidth: 200,
            maxWidth: 250
          }}
          bodyStyle={{ padding: '16px' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            Primary Combination
          </div>
          <div style={{ fontSize: '11px', marginBottom: '4px' }}>
            <strong>BG:</strong> {bgPrimary.key}
          </div>
          <div style={{ fontSize: '11px', marginBottom: '4px' }}>
            <strong>FG:</strong> {fgPrimary.key}
          </div>
          {borderPrimary && (
            <div style={{ fontSize: '11px', marginBottom: '4px' }}>
              <strong>Border:</strong> {borderPrimary.key}
            </div>
          )}
        </Card>
      );
    }

    // Control Primary Solid Base combination with "on" token
    const bgControlPrimarySolidBase = getTokenByPath(structure.bg, ['control', 'primary', 'solid', 'base']);
    const fgOnControlPrimarySolidBase = getTokenByPath(structure.fg, ['on', 'control', 'primary', 'solid', 'base']);
    const borderControlPrimarySolidBase = getTokenByPath(structure.border, ['control', 'primary', 'solid', 'base']);

    if (bgControlPrimarySolidBase && fgOnControlPrimarySolidBase) {
      combinations.push(
        <Card
          key="control-primary-solid-base-combination"
          size="small"
          style={{
            backgroundColor: bgControlPrimarySolidBase.value,
            color: fgOnControlPrimarySolidBase.value,
            border: `2px solid ${borderControlPrimarySolidBase ? borderControlPrimarySolidBase.value : '#d9d9d9'}`,
            minHeight: 120,
            margin: '8px',
            minWidth: 200,
            maxWidth: 250
          }}
          bodyStyle={{ padding: '16px' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            Control Primary Solid Base
          </div>
          <div style={{ fontSize: '11px', marginBottom: '4px' }}>
            <strong>BG:</strong> {bgControlPrimarySolidBase.key}
          </div>
          <div style={{ fontSize: '11px', marginBottom: '4px' }}>
            <strong>FG:</strong> {fgOnControlPrimarySolidBase.key}
          </div>
          {borderControlPrimarySolidBase && (
            <div style={{ fontSize: '11px', marginBottom: '4px' }}>
              <strong>Border:</strong> {borderControlPrimarySolidBase.key}
            </div>
          )}
        </Card>
      );
    }

    return combinations;
  };

  const structure = parseTokenStructure(tokens);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <EyeOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2}>Design Tokens Visualizer</Title>
          <Text type="secondary">
            Each card demonstrates the relationship between background, foreground, and border tokens. 
            "On" tokens are specifically designed for colored backgrounds, while regular tokens work on any surface.
          </Text>
        </div>

        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Space>
            <Upload
              accept=".json"
              beforeUpload={handleFileUpload}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>
                Upload Token File
              </Button>
            </Upload>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={loadDefaultTokens}
            >
              Load Default Tokens
            </Button>
          </Space>
        </div>

        <Alert
          message="Token Relationship Guide"
          description={
            <div>
              <p><strong>Background Tokens:</strong> Control the card background color</p>
              <p><strong>Foreground Tokens:</strong> Control the text color - "on" variants are for colored backgrounds</p>
              <p><strong>Border Tokens:</strong> Control the card border color</p>
              <p><strong>Token Names:</strong> Show the exact CSS variable name and resolved hex value</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Divider />

        {/* Special Token Combinations */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3}>Special Token Combinations</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            These cards demonstrate specific token relationships like primary combinations and "on" token usage.
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {renderSpecialCombinations(structure)}
          </div>
        </div>

        <Divider />

        {/* Background Tokens */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3}>Background Tokens</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Each card uses a background token with its corresponding foreground and border tokens applied.
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {renderTokenCards(structure.bg, [], structure)}
          </div>
        </div>

        <Divider />

        {/* Foreground Only Tokens */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3}>Foreground Tokens</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Foreground tokens that don't have corresponding background tokens, shown on neutral backgrounds.
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(structure.fg).map(([key, value]) => {
              if (value && value.key && value.value && !getTokenByPath(structure.bg, [key])) {
                return (
                  <Card
                    key={`fg-only-${key}`}
                    size="small"
                    style={{
                      backgroundColor: '#ffffff',
                      color: value.value,
                      border: '2px solid #d9d9d9',
                      minHeight: 120,
                      margin: '8px',
                      minWidth: 200,
                      maxWidth: 250
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      {key}
                    </div>
                    <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                      <strong>FG:</strong> {value.key}
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>
                      {value.value}
                    </div>
                  </Card>
                );
              }
              return null;
            }).filter(Boolean)}
          </div>
        </div>

        <Divider />

        {/* Border Only Tokens */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3}>Border Tokens</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Border tokens that don't have corresponding background tokens, shown with neutral styling.
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(structure.border).map(([key, value]) => {
              if (value && value.key && value.value && !getTokenByPath(structure.bg, [key])) {
                return (
                  <Card
                    key={`border-only-${key}`}
                    size="small"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      border: `2px solid ${value.value}`,
                      minHeight: 120,
                      margin: '8px',
                      minWidth: 200,
                      maxWidth: 250
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      {key}
                    </div>
                    <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                      <strong>Border:</strong> {value.key}
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>
                      {value.value}
                    </div>
                  </Card>
                );
              }
              return null;
            }).filter(Boolean)}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DesignTokens;