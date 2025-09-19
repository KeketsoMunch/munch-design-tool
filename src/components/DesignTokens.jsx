import React, { useState } from 'react';
import { Card, Typography, Upload, Button, Space, Divider, Row, Col, message, Alert } from 'antd';
import { UploadOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const DesignTokens = () => {
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock color values for demonstration (since tokens reference other tokens)
  const mockColors = {
    '{(MUNCH).Grey.100}': '#f5f5f5',
    '{(MUNCH).Grey.200}': '#e8e8e8',
    '{(MUNCH).Grey.300}': '#d9d9d9',
    '{(MUNCH).Grey.400}': '#bfbfbf',
    '{(MUNCH).Grey.500*}': '#8c8c8c',
    '{(MUNCH).Grey.600}': '#595959',
    '{(MUNCH).Grey.700}': '#434343',
    '{(MUNCH).Grey.800}': '#262626',
    '{(MUNCH).Grey.900}': '#1f1f1f',
    '{(MUNCH).Grey.1300}': '#141414',
    '{(MUNCH).Grey.2100}': '#000000',
    '{(MUNCH).Grey.2200}': '#000000',
    '{(MUNCH).Base.200}': '#e6f4ff',
    '{(MUNCH).Base.300}': '#bae0ff',
    '{(MUNCH).Base.400}': '#91caff',
    '{(MUNCH).Base.500*}': '#69b1ff',
    '{(MUNCH).Base.600}': '#4096ff',
    '{(MUNCH).Base.800}': '#1677ff',
    '{(MUNCH).Base.900}': '#0958d9',
    '{(MUNCH).Base.2100}': '#002766',
    '{(MUNCH).Overlay.70%}': 'rgba(0, 0, 0, 0.7)',
    '{SYS.Colours.Light.Solid.Base}': '#ffffff',
    '{SYS.Colours.Light.Solid.Focus}': '#f0f0f0',
    '{SYS.Colours.Light.Solid.Hover}': '#fafafa',
    '{SYS.Colours.Control Primary.Soft.Base}': '#e6f4ff',
    '{SYS.Colours.Control Primary.Soft.Hover}': '#bae0ff',
    '{SYS.Colours.Control Primary.Soft.Focus}': '#e6f4ff',
    '{SYS.Colours.Control Primary.Solid.Base}': '#d9d9d9',
    '{SYS.Colours.Control Primary.Solid.Hover}': '#bfbfbf',
    '{SYS.Colours.Control Primary.Solid.Focus}': '#d9d9d9',
    '{SYS.Colours.Control Secondary.Solid.Base}': '#e8e8e8',
    '{SYS.Colours.Control Secondary.Solid.Hover}': '#d9d9d9',
    '{SYS.Colours.Control Secondary.Solid.Focus}': '#e8e8e8',
    '{SYS.Colours.Control Tertiary.Solid.Base}': '#f5f5f5',
    '{SYS.Colours.Control Tertiary.Solid.Hover}': '#e8e8e8',
    '{SYS.Colours.Control Tertiary.Solid.Focus}': '#f5f5f5',
    '{Semantics.Colours.Neutral.Solid.Base}': '#595959',
    '{Semantics.Colours.Neutral.Solid.Hover}': '#434343',
    '{Semantics.Colours.Neutral.Solid.Focus}': '#595959',
    '{Semantics.Colours.Neutral.Soft.Base}': '#f0f0f0',
    '{Semantics.Colours.Neutral.Soft.Hover}': '#e8e8e8',
    '{Semantics.Colours.Neutral.Soft.Focus}': '#f0f0f0',
    '{Semantics.Colours.Light.Soft.Base}': '#fafafa',
    '{Semantics.Colours.Light.Soft.Hover}': '#f5f5f5',
    '{Semantics.Colours.Light.Soft.Focus}': '#fafafa',
    '{Semantics.Colours.Dark.Soft.Base}': '#262626',
    '{Semantics.Colours.Dark.Soft.Hover}': '#1f1f1f',
    '{Semantics.Colours.Dark.Soft.Focus}': '#262626'
  };

  const resolveTokenValue = (value) => {
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      // First try to resolve from mock colors
      if (mockColors[value]) {
        return mockColors[value];
      }
      
      // If not found in mock colors, try to resolve from the loaded tokens
      if (tokens) {
        const resolvedValue = resolveTokenReference(value, tokens);
        if (resolvedValue && resolvedValue !== value) {
          return resolveTokenValue(resolvedValue); // Recursively resolve if it's another reference
        }
      }
      
      // Fallback color
      return '#cccccc';
    }
    return value;
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

  const loadDefaultTokens = () => {
    // Load the existing tokens from the data file
    import('../data/system-studio-semantics.json')
      .then(data => {
        setTokens(data.default || data);
        message.success('Default design tokens loaded!');
      })
      .catch(() => {
        message.error('Failed to load default tokens');
      });
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

  const renderSystemTokens = () => {
    if (!tokens || !tokens['System S/Light'] || !tokens['System S/Light'].SYS) {
      return null;
    }

    const sys = tokens['System S/Light'].SYS;
    const bgTokens = sys.Bg;
    const fgTokens = sys.Fg;
    const borderTokens = sys.Border;

    return (
      <div>
        <Title level={3}>System Design Tokens Visualization</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Each card shows a token applied as background color with corresponding foreground and border colors.
          The hierarchy and relationships between tokens are preserved.
        </Text>

        {/* Background Tokens */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4}>Background Tokens</Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {renderTokenGroup('Background', bgTokens, bgTokens, fgTokens, borderTokens)}
          </div>
        </div>

        {/* Foreground Tokens */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4}>Foreground Tokens</Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {renderTokenGroup('Foreground', fgTokens, bgTokens, fgTokens, borderTokens)}
          </div>
        </div>

        {/* Border Tokens */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4}>Border Tokens</Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {renderTokenGroup('Border', borderTokens, bgTokens, fgTokens, borderTokens)}
          </div>
        </div>

        {/* Control Combinations */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4}>Control Token Combinations</Title>
          <Row gutter={[16, 16]}>
            {/* Control Primary */}
            <Col span={8}>
              <Title level={5}>Control Primary</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bgTokens['Control Primary'] && Object.keys(bgTokens['Control Primary']).map(variant => 
                  Object.keys(bgTokens['Control Primary'][variant]).map(state => {
                    const bgToken = bgTokens['Control Primary'][variant][state];
                    const fgToken = fgTokens['On'] && fgTokens['On']['Control Primary'] && 
                                   fgTokens['On']['Control Primary'][variant] && 
                                   fgTokens['On']['Control Primary'][variant][state];
                    const borderToken = borderTokens['Control Primary'] && 
                                       borderTokens['Control Primary'][variant] && 
                                       borderTokens['Control Primary'][variant][state];
                    
                    return renderTokenCard(
                      `Control Primary/${variant}/${state}`,
                      bgToken,
                      bgToken,
                      fgToken,
                      borderToken
                    );
                  })
                )}
              </div>
            </Col>

            {/* Control Secondary */}
            <Col span={8}>
              <Title level={5}>Control Secondary</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bgTokens['Control Secondary'] && Object.keys(bgTokens['Control Secondary']).map(variant => 
                  Object.keys(bgTokens['Control Secondary'][variant]).map(state => {
                    const bgToken = bgTokens['Control Secondary'][variant][state];
                    const fgToken = fgTokens['On'] && fgTokens['On']['Control Secondary'] && 
                                   fgTokens['On']['Control Secondary'][variant] && 
                                   fgTokens['On']['Control Secondary'][variant][state];
                    const borderToken = borderTokens['Control Secondary'] && 
                                       borderTokens['Control Secondary'][variant] && 
                                       borderTokens['Control Secondary'][variant][state];
                    
                    return renderTokenCard(
                      `Control Secondary/${variant}/${state}`,
                      bgToken,
                      bgToken,
                      fgToken,
                      borderToken
                    );
                  })
                )}
              </div>
            </Col>

            {/* Control Tertiary */}
            <Col span={8}>
              <Title level={5}>Control Tertiary</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bgTokens['Control Tertiary'] && Object.keys(bgTokens['Control Tertiary']).map(variant => 
                  Object.keys(bgTokens['Control Tertiary'][variant]).map(state => {
                    const bgToken = bgTokens['Control Tertiary'][variant][state];
                    const fgToken = fgTokens['On'] && fgTokens['On']['Control Tertiary'] && 
                                   fgTokens['On']['Control Tertiary'][variant] && 
                                   fgTokens['On']['Control Tertiary'][variant][state];
                    const borderToken = borderTokens['Control Tertiary'] && 
                                       borderTokens['Control Tertiary'][variant] && 
                                       borderTokens['Control Tertiary'][variant][state];
                    
                    return renderTokenCard(
                      `Control Tertiary/${variant}/${state}`,
                      bgToken,
                      bgToken,
                      fgToken,
                      borderToken
                    );
                  })
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* Simple Tokens */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4}>Simple Token Pairs</Title>
          <Row gutter={[16, 16]}>
            {['Primary', 'Secondary', 'Tertiary', 'Neutral', 'Gray', 'Disabled', 'Skeleton', 'Placeholder', 'Dark'].map(tokenName => {
              const bgToken = bgTokens[tokenName];
              const fgToken = fgTokens[tokenName] || fgTokens['On'] && fgTokens['On'][tokenName];
              const borderToken = borderTokens[tokenName];
              
              if (!bgToken) return null;
              
              return (
                <Col span={6} key={tokenName}>
                  {renderTokenCard(tokenName, bgToken, bgToken, fgToken, borderToken)}
                </Col>
              );
            })}
          </Row>
        </div>
      </div>
    );
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

            {renderSystemTokens()}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DesignTokens;