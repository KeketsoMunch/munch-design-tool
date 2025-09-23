import React, { useState } from 'react';
import { Card, Typography, Upload, Button, Space, Divider, Row, Col, message, Alert } from 'antd';
import { UploadOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import flatTokens from '../data/system-studio-semantics-flat.json';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const DesignTokens = () => {
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load default tokens from flat JSON
  const loadDefaultTokens = () => {
    setTokens(flatTokens);
    message.success('Default design tokens loaded!');
  };

  const resolveTokenValue = (value) => {
    // For flat tokens, the value should already be a color
    if (typeof value === 'string' && value.startsWith('#')) {
      return value;
    }
    
    // If it's a CSS variable reference, try to resolve it
    if (typeof value === 'string' && value.startsWith('--')) {
      return flatTokens[value] || '#cccccc';
    }
    
    // Fallback
    return value || '#cccccc';
  };

  const resolveTokenReference = (reference, tokenData) => {
    // Remove the curly braces and parse the reference
    const cleanRef = reference.slice(1, -1);
    
    // Handle different reference formats
    if (cleanRef.startsWith('SYS.')) {
      // Handle SYS references like {SYS.Colours.Light.Solid.Base}
      const path = cleanRef.replace('SYS.', '').split('.');
      return getTokenByPath(tokenData, ['System S/Light', 'SYS', ...path]);
    } else if (cleanRef.startsWith('Semantics.')) {
      // Handle Semantics references - these might need to be mapped to actual tokens
      // For now, return a reasonable fallback
      return null;
    } else if (cleanRef.startsWith('(MUNCH).')) {
      // Handle MUNCH references like {(MUNCH).Grey.100}
      // These are base color references that we'll need to map
      return getMunchColor(cleanRef);
    }
    
    return null;
  };

  const getTokenByPath = (data, pathArray) => {
    let current = data;
    for (const segment of pathArray) {
      if (current && current[segment]) {
        current = current[segment];
      } else {
        return null;
      }
    }
    return current && current.$value ? current.$value : null;
  };

  const getMunchColor = (reference) => {
    // Map MUNCH color references to actual hex values
    const munchColorMap = {
      '(MUNCH).Grey.100': '#f5f5f5',
      '(MUNCH).Grey.200': '#e8e8e8',
      '(MUNCH).Grey.300': '#d9d9d9',
      '(MUNCH).Grey.400': '#bfbfbf',
      '(MUNCH).Grey.500*': '#8c8c8c',
      '(MUNCH).Grey.600': '#595959',
      '(MUNCH).Grey.700': '#434343',
      '(MUNCH).Grey.800': '#262626',
      '(MUNCH).Grey.900': '#1f1f1f',
      '(MUNCH).Grey.1300': '#141414',
      '(MUNCH).Grey.2100': '#000000',
      '(MUNCH).Grey.2200': '#000000',
      '(MUNCH).Base.200': '#e6f4ff',
      '(MUNCH).Base.300': '#bae0ff',
      '(MUNCH).Base.400': '#91caff',
      '(MUNCH).Base.500*': '#69b1ff',
      '(MUNCH).Base.600': '#4096ff',
      '(MUNCH).Base.800': '#1677ff',
      '(MUNCH).Base.900': '#0958d9',
      '(MUNCH).Base.2100': '#002766',
      '(MUNCH).Overlay.70%': 'rgba(0, 0, 0, 0.7)'
    };
    
    return munchColorMap[reference] || null;
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

  // Convert flat tokens to grouped structure for display
  const convertFlatTokensToGrouped = (flatTokens) => {
    const grouped = {
      bg: {},
      fg: {},
      border: {}
    };
    
    Object.entries(flatTokens).forEach(([key, value]) => {
      if (key.startsWith('--system-bg-')) {
        const path = key.replace('--system-bg-', '').split('-');
        setNestedValue(grouped.bg, path, { $value: value, $type: 'color' });
      } else if (key.startsWith('--system-fg-')) {
        const path = key.replace('--system-fg-', '').split('-');
        setNestedValue(grouped.fg, path, { $value: value, $type: 'color' });
      } else if (key.startsWith('--system-border-')) {
        const path = key.replace('--system-border-', '').split('-');
        setNestedValue(grouped.border, path, { $value: value, $type: 'color' });
      }
    });
    
    return grouped;
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

  const renderTokenCard = (tokenPath, tokenData, bgToken, fgToken, borderToken) => {
    const bgColor = resolveTokenValue(bgToken?.$value);
    const fgColor = resolveTokenValue(fgToken?.$value);
    const borderColor = resolveTokenValue(borderToken?.$value);
    
    return (
      <Card
        key={tokenPath}
        size="small"
        style={{
          backgroundColor: bgColor,
          color: fgColor,
          border: `1px solid ${borderColor || '#d9d9d9'}`,
          minHeight: 80,
          margin: '4px'
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
          {tokenPath}
        </div>
        <div style={{ fontSize: '10px', opacity: 0.8 }}>
          BG: {bgColor}
        </div>
        <div style={{ fontSize: '10px', opacity: 0.8 }}>
          FG: {fgColor}
        </div>
        {borderColor && (
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Border: {borderColor}
          </div>
        )}
      </Card>
    );
  };

  const renderTokenGroup = (groupName, groupData, bgTokens, fgTokens, borderTokens) => {
    const cards = [];
    
    const processTokens = (data, path = '') => {
      Object.keys(data).forEach(key => {
        if (key.startsWith('$')) return; // Skip metadata
        
        const currentPath = path ? `${path}/${key}` : key;
        const value = data[key];
        
        if (value && typeof value === 'object' && value.$value) {
          // This is a token with a value
          const bgTokenPath = currentPath.replace(/^Fg/, 'Bg').replace(/^Border/, 'Bg');
          const fgTokenPath = currentPath.replace(/^Bg/, 'Fg').replace(/^Border/, 'Fg');
          const borderTokenPath = currentPath.replace(/^Bg/, 'Border').replace(/^Fg/, 'Border');
          
          // Handle "On" tokens specially
          let onTokenPath = null;
          if (currentPath.includes('Bg/')) {
            onTokenPath = currentPath.replace('Bg/', 'Fg/On/');
          }
          
          const bgToken = getNestedToken(bgTokens, bgTokenPath) || value;
          const fgToken = getNestedToken(fgTokens, onTokenPath || fgTokenPath) || getNestedToken(fgTokens, fgTokenPath);
          const borderToken = getNestedToken(borderTokens, borderTokenPath);
          
          cards.push(renderTokenCard(currentPath, value, bgToken, fgToken, borderToken));
        } else if (value && typeof value === 'object') {
          // Recurse into nested objects
          processTokens(value, currentPath);
        }
      });
    };
    
    processTokens(groupData);
    return cards;
  };

  const getNestedToken = (obj, path) => {
    if (!obj || !path) return null;
    
    const parts = path.split('/');
    let current = obj;
    
    for (const part of parts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current && current.$value ? current : null;
  };

  const renderFlatTokens = () => {
    if (!tokens) {
      return null;
    }

    // Check if tokens is flat structure or nested
    const isFlat = Object.keys(tokens).some(key => key.startsWith('--system-'));
    
    if (isFlat) {
      return renderFlatTokensStructure(tokens);
    } else {
      // Handle nested structure (original format)
      return renderNestedTokensStructure(tokens);
    }
  };
  
  const renderFlatTokensStructure = (flatTokens) => {
    const grouped = convertFlatTokensToGrouped(flatTokens);

    return (
      <div>
        <Title level={3}>Design Tokens Visualization</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Each card shows a token applied with its corresponding color value from the flat token structure.
        </Text>

        {renderTokenSection('Background Tokens', grouped.bg, 'bg')}
        {renderTokenSection('Foreground Tokens', grouped.fg, 'fg')}
        {renderTokenSection('Border Tokens', grouped.border, 'border')}
      </div>
    );
  };
  
  const renderTokenSection = (title, tokens, type) => {
    return (
      <div style={{ marginBottom: 32 }}>
        <Title level={4}>{title}</Title>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {renderTokenCards(tokens, type, '')}
        </div>
      </div>
    );
  };
  
  const renderTokenCards = (obj, type, path) => {
    const cards = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}/${key}` : key;
      
      if (value && value.$value) {
        // This is a token with a value
        const bgColor = type === 'bg' ? value.$value : '#ffffff';
        const fgColor = type === 'fg' ? value.$value : '#000000';
        const borderColor = type === 'border' ? value.$value : '#d9d9d9';
        
        cards.push(
          <Card
            key={currentPath}
            size="small"
            style={{
              backgroundColor: bgColor,
              color: fgColor,
              border: `1px solid ${borderColor}`,
              minHeight: 80,
              margin: '4px',
              minWidth: 150
            }}
            bodyStyle={{ padding: '12px' }}
          >
            <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
              {currentPath}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              {value.$value}
            </div>
          </Card>
        );
      } else if (typeof value === 'object') {
        // Recurse into nested objects
        cards.push(...renderTokenCards(value, type, currentPath));
      }
    });
    
    return cards;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <EyeOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2}>Design Tokens Visualizer</Title>
          <Text type="secondary">
            Upload your design tokens JSON file to visualize how tokens are applied to UI elements.
            Each card demonstrates the relationship between background, foreground, and border tokens.
          </Text>
        </div>

        {!tokens && (
          <div style={{ marginBottom: 32 }}>
            <Row gutter={[24, 24]} align="middle">
              <Col span={12}>
                <Dragger
                  accept=".json"
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                  loading={loading}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag JSON file to upload</p>
                  <p className="ant-upload-hint">
                    Upload your design tokens JSON file to visualize the token relationships
                  </p>
                </Dragger>
              </Col>
              <Col span={12} style={{ textAlign: 'center' }}>
                <div>
                  <Text strong>Or try with sample data:</Text>
                  <br />
                  <Button 
                    type="primary" 
                    icon={<ReloadOutlined />}
                    onClick={loadDefaultTokens}
                    style={{ marginTop: 16 }}
                  >
                    Load Default Tokens
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {tokens && (
          <div>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <Space>
                <Button 
                  icon={<UploadOutlined />}
                  onClick={() => setTokens(null)}
                >
                  Upload Different File
                </Button>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />}
                  onClick={loadDefaultTokens}
                >
                  Reload Default
                </Button>
              </Space>
            </div>

            <Alert
              message="Token Visualization Active"
              description="Each card shows a token applied as styling. Background tokens control the card background, foreground tokens control text color, and border tokens control the border color. The 'On' tokens are used for text that appears on colored backgrounds."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Divider />

            {renderFlatTokens()}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DesignTokens;