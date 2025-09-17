import React, { useState, useEffect } from 'react';
import { Card, Input, Slider, Row, Col, Typography, Button, Space, Switch, message } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ColorPalette = () => {
  const [colorName, setColorName] = useState('navy');
  const [baseColor, setBaseColor] = useState('#1E4BCD');
  const [minRange, setMinRange] = useState(50);
  const [maxRange, setMaxRange] = useState(950);
  const [customRanges, setCustomRanges] = useState('');
  const [useCustomRanges, setUseCustomRanges] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightnessMax, setLightnessMax] = useState(95);
  const [lightnessMin, setLightnessMin] = useState(5);
  const [isPerceived, setIsPerceived] = useState(true);

  // Convert hex to HSL
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  // Convert HSL to hex
  const hslToHex = (h, s, l) => {
    h = h % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Generate color palette based on settings
  const generatePalette = () => {
    let shades;
    
    if (useCustomRanges && customRanges.trim()) {
      // Parse custom ranges from comma-separated string
      shades = customRanges
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n) && n >= 0 && n <= 2100)
        .sort((a, b) => a - b);
    } else {
      // Generate automatic ranges
      shades = [];
      const step = Math.max(1, Math.floor((maxRange - minRange) / 10));
      
      for (let i = minRange; i <= maxRange; i += step) {
        shades.push(i);
      }
      
      // Ensure we always include the max range
      if (shades[shades.length - 1] !== maxRange) {
        shades.push(maxRange);
      }
      
      // Limit to reasonable number of shades (max 15)
      if (shades.length > 15) {
        const newStep = Math.floor((maxRange - minRange) / 14);
        shades = [];
        for (let i = minRange; i <= maxRange; i += newStep) {
          shades.push(i);
        }
        if (shades[shades.length - 1] !== maxRange) {
          shades.push(maxRange);
        }
      }
    }
    
    if (shades.length === 0) {
      shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    }
    
    // Get base HSL from hex
    const [baseH, baseS, baseL] = hexToHsl(baseColor);
    
    return shades.map(shade => {
      // Calculate lightness based on shade (inverted scale)
      const normalizedShade = (shade - Math.min(...shades)) / (Math.max(...shades) - Math.min(...shades));
      let lightness;
      
      if (normalizedShade <= 0.5) {
        // Lighter shades: map to lightnessMax down to middle
        const ratio = (0.5 - normalizedShade) / 0.5;
        lightness = baseL + (lightnessMax - baseL) * ratio;
      } else {
        // Darker shades: map from middle down to lightnessMin
        const ratio = (normalizedShade - 0.5) / 0.5;
        lightness = baseL - (baseL - lightnessMin) * ratio;
      }

      // Apply adjustments
      const adjustedHue = (baseH + hue + 360) % 360;
      const adjustedSaturation = Math.max(0, Math.min(100, baseS + saturation));
      const finalLightness = Math.max(lightnessMin, Math.min(lightnessMax, lightness));

      const color = hslToHex(adjustedHue, adjustedSaturation, finalLightness);
      
      return {
        shade,
        color,
        lightness: finalLightness
      };
    });
  };

  const palette = generatePalette();

  const generateCSS = () => {
    return palette.map(({ shade, color }) => 
      `  --color-${colorName}-${shade}: ${color};`
    ).join('\n');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Copied to clipboard!');
    }).catch(() => {
      message.error('Failed to copy to clipboard');
    });
  };

  const resetControls = () => {
    setHue(0);
    setSaturation(0);
    setLightnessMax(95);
    setLightnessMin(5);
    setMinRange(50);
    setMaxRange(950);
    setCustomRanges('');
    setUseCustomRanges(false);
  };

  const handleBaseColorChange = (e) => {
    const value = e.target.value;
    setBaseColor(value);
    
    // Validate hex color
    if (!/^#[0-9A-F]{6}$/i.test(value) && value.length === 7) {
      return;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>Palette Generator and API for Tailwind CSS</Title>
          <Text type="secondary">
            Generate beautiful color palettes from any hex color with full control over hue, saturation, and lightness distribution.
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Title level={4}>Palette Creator</Title>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>Name</Text>
              <Input 
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                style={{ marginTop: 8 }}
                placeholder="Color name (e.g., navy, blue, primary)"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Base Color (Hex)</Text>
              <Space.Compact style={{ width: '100%', marginTop: 8 }}>
                <Input 
                  value={baseColor}
                  onChange={handleBaseColorChange}
                  placeholder="#1E4BCD"
                  maxLength={7}
                />
                <Button 
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(baseColor)}
                />
              </Space.Compact>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>Range Configuration</Text>
                <Switch 
                  checked={useCustomRanges}
                  onChange={setUseCustomRanges}
                  size="small"
                />
              </div>
              
              {useCustomRanges ? (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 4 }}>
                    Enter comma-separated values (e.g., 50,100,200,300,400,500,600,700,800,900,950)
                  </Text>
                  <TextArea
                    value={customRanges}
                    onChange={(e) => setCustomRanges(e.target.value)}
                    placeholder="50,100,200,300,400,500,600,700,800,900,950"
                    rows={2}
                    style={{ fontSize: '12px' }}
                  />
                </div>
              ) : (
                <Row gutter={8}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Min Range</Text>
                    <Input
                      type="number"
                      value={minRange}
                      onChange={(e) => setMinRange(Math.max(0, parseInt(e.target.value) || 0))}
                      min={0}
                      max={2100}
                      style={{ marginTop: 4 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Max Range</Text>
                    <Input
                      type="number"
                      value={maxRange}
                      onChange={(e) => setMaxRange(Math.min(2100, Math.max(minRange + 1, parseInt(e.target.value) || 950)))}
                      min={minRange + 1}
                      max={2100}
                      style={{ marginTop: 4 }}
                    />
                  </Col>
                </Row>
              )}
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Hue Shift</Text>
                <Slider
                  value={hue}
                  onChange={setHue}
                  min={-180}
                  max={180}
                  style={{ marginTop: 8 }}
                  tooltip={{ formatter: (value) => `${value}°` }}
                />
                <Text type="secondary">{hue}°</Text>
              </Col>
              <Col span={12}>
                <Text strong>Saturation Shift</Text>
                <Slider
                  value={saturation}
                  onChange={setSaturation}
                  min={-100}
                  max={100}
                  style={{ marginTop: 8 }}
                  tooltip={{ formatter: (value) => `${value}%` }}
                />
                <Text type="secondary">{saturation}%</Text>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Text strong>Lightness Maximum</Text>
                <Slider
                  value={lightnessMax}
                  onChange={setLightnessMax}
                  min={50}
                  max={100}
                  style={{ marginTop: 8 }}
                  tooltip={{ formatter: (value) => `${value}%` }}
                />
                <Text type="secondary">{lightnessMax}%</Text>
              </Col>
              <Col span={12}>
                <Text strong>Lightness Minimum</Text>
                <Slider
                  value={lightnessMin}
                  onChange={setLightnessMin}
                  min={0}
                  max={50}
                  style={{ marginTop: 8 }}
                  tooltip={{ formatter: (value) => `${value}%` }}
                />
                <Text type="secondary">{lightnessMin}%</Text>
              </Col>
            </Row>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Text>Perceived</Text>
                <Switch 
                  checked={isPerceived}
                  onChange={setIsPerceived}
                />
                <Text>Linear</Text>
              </Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={resetControls}
                size="small"
              >
                Reset
              </Button>
            </div>
          </Col>

          <Col span={12}>
            <Title level={4}>Output</Title>
            <Text type="secondary">Tailwind CSS Version: 4</Text>
            
            <div style={{ marginTop: 16 }}>
              <Text strong>Output color mode:</Text>
              <Space style={{ marginLeft: 8 }}>
                <Button size="small" type="primary">hex</Button>
                <Button size="small" disabled>oklch</Button>
                <Button size="small" disabled>p3-4</Button>
                <Button size="small" disabled>hsl</Button>
              </Space>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>CSS Variables</Text>
                <Button 
                  size="small" 
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(generateCSS())}
                >
                  Copy
                </Button>
              </div>
              <TextArea
                value={generateCSS()}
                rows={12}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
                readOnly
              />
            </div>

            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Paste this into your CSS file or Tailwind config
            </Text>
          </Col>
        </Row>

        {/* Color Palette Display */}
        <div style={{ marginTop: 32 }}>
          <Title level={4}>Color Palette Preview</Title>
          <div style={{ display: 'flex', gap: 2, marginTop: 16, borderRadius: 8, overflow: 'hidden' }}>
            {palette.map(({ shade, color }) => (
              <div
                key={shade}
                style={{
                  backgroundColor: color,
                  height: 100,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 4px',
                  color: shade > 500 ? 'white' : 'black',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  position: 'relative'
                }}
                onClick={() => copyToClipboard(color)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.zIndex = '1';
                }}
                title={`Click to copy ${color}`}
              >
                <span>{shade}</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>{color}</span>
              </div>
            ))}
          
          </div>
            <Slider range step={50}  defaultValue={[minRange,maxRange]}  />
        </div>

        {/* Lightness Distribution */}
        <div style={{ marginTop: 32 }}>
          <Title level={4}>Lightness Distribution 0-100</Title>
          <div style={{ 
            background: '#f5f5f5', 
            padding: 16, 
            borderRadius: 8,
            marginTop: 16
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Text strong>100 (White)</Text>
              <Text strong>0 (Black)</Text>
            </div>
            
            <div style={{ 
              height: 60,
              background: 'linear-gradient(to right, white, black)',
              borderRadius: 4,
              position: 'relative'
            }}>
              {palette.map(({ shade, lightness }, index) => (
                <div
                  key={shade}
                  style={{
                    position: 'absolute',
                    left: `${100 - lightness}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#1890ff',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    zIndex: 2
                  }}
                  title={`${shade}: ${Math.round(lightness)}% lightness`}
                />
              ))}
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: 8,
              fontSize: '12px',
              color: '#666'
            }}>
              <span>Light</span>
              <span>Dark</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Space>
            <Button type="primary">Demo</Button>
            <Button>Add Palette</Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default ColorPalette;