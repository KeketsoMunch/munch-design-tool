import React, { useState, useEffect } from 'react';
import { Card, Input, Slider, Row, Col, Typography, Button, Space, Switch, message, Upload, Divider } from 'antd';
import { CopyOutlined, ReloadOutlined, UploadOutlined, DownloadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ColorPalette = () => {
  const [colorName, setColorName] = useState('navy');
  const [baseColor, setBaseColor] = useState('#1E4BCD');
  const [minRange, setMinRange] = useState(50);
  const [maxRange, setMaxRange] = useState(2100);
  const [customRanges, setCustomRanges] = useState('');
  const [useCustomRanges, setUseCustomRanges] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightnessMax, setLightnessMax] = useState(95);
  const [lightnessMin, setLightnessMin] = useState(5);
  const [isPerceived, setIsPerceived] = useState(true);
  const [graphPoints, setGraphPoints] = useState([
    { shade: 50, lightness: 95 },
    { shade: 500, lightness: 50 },
    { shade: 950, lightness: 5 }
  ]);
  const [curveIntensity, setCurveIntensity] = useState(0);
  const [connectionStrength, setConnectionStrength] = useState(50);
  const [showGraph, setShowGraph] = useState(true);

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

  // Generate lightness curve based on graph points
  const generateLightnessCurve = (shade) => {
    // Sort points by shade
    const sortedPoints = [...graphPoints].sort((a, b) => a.shade - b.shade);
    
    // Find the two points to interpolate between
    let leftPoint = sortedPoints[0];
    let rightPoint = sortedPoints[sortedPoints.length - 1];
    
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      if (shade >= sortedPoints[i].shade && shade <= sortedPoints[i + 1].shade) {
        leftPoint = sortedPoints[i];
        rightPoint = sortedPoints[i + 1];
        break;
      }
    }
    
    // If shade is outside the range, use the nearest point
    if (shade < sortedPoints[0].shade) {
      return sortedPoints[0].lightness;
    }
    if (shade > sortedPoints[sortedPoints.length - 1].shade) {
      return sortedPoints[sortedPoints.length - 1].lightness;
    }
    
    // Linear interpolation with curve adjustment
    const t = (shade - leftPoint.shade) / (rightPoint.shade - leftPoint.shade);
    
    // Apply curve intensity (0 = linear, positive = ease-in-out curve)
    let adjustedT = t;
    if (curveIntensity !== 0) {
      const intensity = curveIntensity / 100;
      if (intensity > 0) {
        // Ease-in-out curve
        adjustedT = t < 0.5 
          ? 2 * Math.pow(t, 1 + intensity) 
          : 1 - 2 * Math.pow(1 - t, 1 + intensity);
      } else {
        // Inverse curve (more linear in middle)
        adjustedT = 0.5 + Math.sin((t - 0.5) * Math.PI) * (0.5 + Math.abs(intensity));
      }
    }
    
    return leftPoint.lightness + (rightPoint.lightness - leftPoint.lightness) * adjustedT;
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
      const step = 50; // Always use 50-step increments
      
      for (let i = minRange; i <= maxRange; i += step) {
        shades.push(i);
      }
      
      // Ensure we always include the max range
      if (shades[shades.length - 1] !== maxRange) {
        shades.push(maxRange);
      }
    }
    
    // Always ensure 500 is included in the shades for the base color
    if (!shades.includes(500) && minRange <= 500 && maxRange >= 500) {
      shades.push(500);
    }
    
    // Remove duplicates and sort
    shades = [...new Set(shades)].sort((a, b) => a - b);
    
    if (shades.length === 0) {
      shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    }
    
    // Get base HSL from hex
    const [baseH, baseS, baseL] = hexToHsl(baseColor);
    
    return shades.map(shade => {
      // Use graph-based lightness calculation
      const lightness = generateLightnessCurve(shade);

      let color;
      
      if (shade === 500) {
        // For 500, use the exact base color without any adjustments
        color = baseColor;
      } else {
        // Apply adjustments for all other shades
        const adjustedHue = (baseH + hue + 360) % 360;
        const adjustedSaturation = Math.max(0, Math.min(100, baseS + saturation));
        const finalLightness = Math.max(lightnessMin, Math.min(lightnessMax, lightness));
        color = hslToHex(adjustedHue, adjustedSaturation, finalLightness);
      }
      
      return {
        shade,
        color,
        lightness: shade === 500 ? baseL : Math.max(lightnessMin, Math.min(lightnessMax, lightness))
      };
    });
  };

  const palette = generatePalette();

  const generateJSON = (includeConfig = true) => {
    const paletteObject = {
      name: colorName,
      colors: {},
      ...(includeConfig && {
        config: {
          baseColor,
          minRange,
          maxRange,
          customRanges,
          useCustomRanges,
          hue,
          saturation,
          lightnessMax,
          lightnessMin,
          isPerceived
        }
      }),
      ...(includeConfig && {
        graphPoints,
        curveIntensity,
        connectionStrength
      })
    };
    
    palette.forEach(({ shade, color }) => {
      paletteObject.colors[shade] = color;
    });
    
    return JSON.stringify(paletteObject, null, 2);
  };

  // Graph interaction handlers
  const handleGraphPointDrag = (index, newShade, newLightness) => {
    const newPoints = [...graphPoints];
    const oldPoint = newPoints[index];
    
    // Update the dragged point
    newPoints[index] = {
      shade: Math.max(0, Math.min(2100, newShade)),
      lightness: Math.max(0, Math.min(100, newLightness))
    };
    
    // Apply connection strength to neighboring points
    if (connectionStrength > 0) {
      const strengthFactor = connectionStrength / 100;
      const shadeChange = newPoints[index].shade - oldPoint.shade;
      const lightnessChange = newPoints[index].lightness - oldPoint.lightness;
      
      // Affect neighboring points
      for (let i = 0; i < newPoints.length; i++) {
        if (i !== index) {
          const distance = Math.abs(newPoints[i].shade - oldPoint.shade);
          const maxDistance = 1000; // Maximum distance for influence
          const influence = Math.max(0, 1 - distance / maxDistance) * strengthFactor;
          
          if (influence > 0) {
            newPoints[i] = {
              shade: Math.max(0, Math.min(2100, newPoints[i].shade + shadeChange * influence * 0.3)),
              lightness: Math.max(0, Math.min(100, newPoints[i].lightness + lightnessChange * influence * 0.5))
            };
          }
        }
      }
    }
    
    setGraphPoints(newPoints);
  };

  const addGraphPoint = () => {
    const newShade = 300 + Math.random() * 400; // Random shade between 300-700
    const newLightness = generateLightnessCurve(newShade);
    
    setGraphPoints([...graphPoints, { shade: newShade, lightness: newLightness }]);
  };

  const removeGraphPoint = (index) => {
    if (graphPoints.length > 2) { // Keep at least 2 points
      const newPoints = graphPoints.filter((_, i) => i !== index);
      setGraphPoints(newPoints);
    }
  };

  const resetGraph = () => {
    setGraphPoints([
      { shade: 50, lightness: 95 },
      { shade: 500, lightness: 50 },
      { shade: 950, lightness: 5 }
    ]);
    setCurveIntensity(0);
    setConnectionStrength(50);
  };

  const loadConfiguration = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.config) {
        const config = data.config;
        setColorName(data.name || colorName);
        setBaseColor(config.baseColor || baseColor);
        setMinRange(config.minRange || minRange);
        setMaxRange(config.maxRange || maxRange);
        setCustomRanges(config.customRanges || '');
        setUseCustomRanges(config.useCustomRanges || false);
        setHue(config.hue || 0);
        setSaturation(config.saturation || 0);
        setLightnessMax(config.lightnessMax || 95);
        setLightnessMin(config.lightnessMin || 5);
        setIsPerceived(config.isPerceived !== undefined ? config.isPerceived : true);
        
        if (data.graphPoints) {
          setGraphPoints(data.graphPoints);
        }
        if (data.curveIntensity !== undefined) {
          setCurveIntensity(data.curveIntensity);
        }
        if (data.connectionStrength !== undefined) {
          setConnectionStrength(data.connectionStrength);
        }
        
        message.success('Configuration loaded successfully!');
      } else {
        message.warning('No configuration found in JSON. Only loading name and colors.');
        if (data.name) setColorName(data.name);
      }
    } catch (error) {
      message.error('Invalid JSON format');
    }
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      loadConfiguration(e.target.result);
    };
    reader.readAsText(file);
    return false; // Prevent default upload behavior
  };

  const downloadConfig = () => {
    const jsonData = generateJSON(true);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${colorName}-palette-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    setMaxRange(2100);
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
          <Title level={3}>Palette Generator and API for Munch Software</Title>
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
                      onChange={(e) => setMaxRange(Math.min(2100, Math.max(minRange + 1, parseInt(e.target.value) || 2100)))}
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

            <Divider />

            {/* Graph Controls */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>Lightness Curve Graph</Text>
                <Switch 
                  checked={showGraph}
                  onChange={setShowGraph}
                  size="small"
                />
              </div>
              
              {showGraph && (
                <>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <Text strong>Curve Intensity</Text>
                      <Slider
                        value={curveIntensity}
                        onChange={setCurveIntensity}
                        min={-50}
                        max={50}
                        style={{ marginTop: 8 }}
                        tooltip={{ formatter: (value) => `${value}%` }}
                      />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {curveIntensity}% ({curveIntensity === 0 ? 'Linear' : curveIntensity > 0 ? 'Curved' : 'Inverse'})
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Connection Strength</Text>
                      <Slider
                        value={connectionStrength}
                        onChange={setConnectionStrength}
                        min={0}
                        max={100}
                        style={{ marginTop: 8 }}
                        tooltip={{ formatter: (value) => `${value}%` }}
                      />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {connectionStrength}% (Point influence)
                      </Text>
                    </Col>
                  </Row>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong>Graph Points ({graphPoints.length})</Text>
                    <Space>
                      <Button 
                        size="small" 
                        icon={<PlusOutlined />}
                        onClick={addGraphPoint}
                        disabled={graphPoints.length >= 10}
                      >
                        Add Point
                      </Button>
                      <Button 
                        size="small" 
                        icon={<ReloadOutlined />}
                        onClick={resetGraph}
                      >
                        Reset Graph
                      </Button>
                    </Space>
                  </div>
                </>
              )}
            </div>
          </Col>

          <Col span={12}>
            <Title level={4}>Output</Title>
            <Text type="secondary">Tailwind CSS Version: 4</Text>
            
            <div style={{ marginTop: 16 }}>
              <Text strong>Export Format:</Text>
              <Space style={{ marginLeft: 8 }}>
                <Button size="small" type="primary">JSON</Button>
                <Button size="small" disabled>CSS</Button>
                <Button size="small" disabled>SCSS</Button>
                <Button size="small" disabled>Tailwind</Button>
              </Space>
            </div>

            <div style={{ marginTop: 16 }}>
              <Text strong>Configuration:</Text>
              <Space style={{ marginLeft: 8 }}>
                <Button 
                  size="small" 
                  icon={<DownloadOutlined />}
                  onClick={downloadConfig}
                >
                  Save Config
                </Button>
                <Upload
                  accept=".json"
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                >
                  <Button size="small" icon={<UploadOutlined />}>
                    Load Config
                  </Button>
                </Upload>
              </Space>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>JSON Output</Text>
                <Space>
                  <Button 
                    size="small" 
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(generateJSON(false))}
                  >
                    Copy Colors
                  </Button>
                  <Button 
                    size="small" 
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(generateJSON(true))}
                    type="primary"
                  >
                    Copy with Config
                  </Button>
                </Space>
              </div>
              <TextArea
                value={generateJSON(true)}
                rows={12}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
                readOnly
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ display: 'block' }}>
                JSON includes both colors and configuration for easy sharing and reloading
              </Text>
              <Text type="secondary" style={{ display: 'block', fontSize: '11px' }}>
                Use "Copy Colors" for colors only, or "Copy with Config" to include all settings
              </Text>
            </div>
          </Col>
        </Row>

        {/* Interactive Graph Visualizer */}
        {showGraph && (
          <div style={{ marginTop: 32 }}>
            <Title level={4}>Interactive Lightness Curve</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Drag points to adjust the lightness curve. Connected points will move together based on connection strength.
            </Text>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: 24, 
              borderRadius: 8,
              marginBottom: 16
            }}>
              <svg 
                width="100%" 
                height="300" 
                viewBox="0 0 800 300"
                style={{ border: '1px solid #e1e1e1', borderRadius: 4, background: 'white' }}
              >
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Axes */}
                <line x1="50" y1="250" x2="750" y2="250" stroke="#666" strokeWidth="2" />
                <line x1="50" y1="250" x2="50" y2="50" stroke="#666" strokeWidth="2" />
                
                {/* Axis labels */}
                <text x="400" y="280" textAnchor="middle" fontSize="12" fill="#666">Shade Value</text>
                <text x="25" y="150" textAnchor="middle" fontSize="12" fill="#666" transform="rotate(-90 25 150)">Lightness %</text>
                
                {/* Scale markers */}
                {[0, 500, 1000, 1500, 2000].map(shade => (
                  <g key={shade}>
                    <line 
                      x1={50 + (shade / 2100) * 700} 
                      y1="250" 
                      x2={50 + (shade / 2100) * 700} 
                      y2="255" 
                      stroke="#666" 
                    />
                    <text 
                      x={50 + (shade / 2100) * 700} 
                      y="270" 
                      textAnchor="middle" 
                      fontSize="10" 
                      fill="#666"
                    >
                      {shade}
                    </text>
                  </g>
                ))}
                
                {[0, 25, 50, 75, 100].map(lightness => (
                  <g key={lightness}>
                    <line 
                      x1="45" 
                      y1={250 - (lightness / 100) * 200} 
                      x2="50" 
                      y2={250 - (lightness / 100) * 200} 
                      stroke="#666" 
                    />
                    <text 
                      x="40" 
                      y={250 - (lightness / 100) * 200 + 4} 
                      textAnchor="end" 
                      fontSize="10" 
                      fill="#666"
                    >
                      {lightness}
                    </text>
                  </g>
                ))}
                
                {/* Curve line */}
                <path
                  d={(() => {
                    const points = [];
                    for (let shade = 0; shade <= 2100; shade += 50) {
                      const lightness = generateLightnessCurve(shade);
                      const x = 50 + (shade / 2100) * 700;
                      const y = 250 - (lightness / 100) * 200;
                      points.push(`${shade === 0 ? 'M' : 'L'} ${x} ${y}`);
                    }
                    return points.join(' ');
                  })()}
                  fill="none"
                  stroke="#1890ff"
                  strokeWidth="3"
                />
                
                {/* Interactive points */}
                {graphPoints.map((point, index) => {
                  const x = 50 + (point.shade / 2100) * 700;
                  const y = 250 - (point.lightness / 100) * 200;
                  
                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill="#ff4d4f"
                        stroke="white"
                        strokeWidth="2"
                        style={{ cursor: 'move' }}
                        onMouseDown={(e) => {
                          const svg = e.currentTarget.closest('svg');
                          const rect = svg.getBoundingClientRect();
                          
                          const handleMouseMove = (moveEvent) => {
                            const newX = moveEvent.clientX - rect.left;
                            const newY = moveEvent.clientY - rect.top;
                            
                            const newShade = Math.max(0, Math.min(2100, ((newX - 50) / 700) * 2100));
                            const newLightness = Math.max(0, Math.min(100, ((250 - newY) / 200) * 100));
                            
                            handleGraphPointDrag(index, newShade, newLightness);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      />
                      <text
                        x={x}
                        y={y - 15}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#333"
                        pointerEvents="none"
                      >
                        {Math.round(point.shade)}, {Math.round(point.lightness)}%
                      </text>
                      {graphPoints.length > 2 && (
                        <circle
                          cx={x + 12}
                          cy={y - 12}
                          r="6"
                          fill="#ff7875"
                          stroke="white"
                          strokeWidth="1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => removeGraphPoint(index)}
                        />
                      )}
                      {graphPoints.length > 2 && (
                        <text
                          x={x + 12}
                          y={y - 8}
                          textAnchor="middle"
                          fontSize="8"
                          fill="white"
                          pointerEvents="none"
                        >
                          ×
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              
              <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
                <Text strong>Instructions:</Text>
                <ul style={{ margin: '8px 0', paddingLeft: 16 }}>
                  <li>Drag red points to adjust the lightness curve</li>
                  <li>Click the × on points to remove them (minimum 2 points required)</li>
                  <li>Use "Add Point" to create new control points</li>
                  <li>Adjust curve intensity for linear vs curved interpolation</li>
                  <li>Connection strength controls how much points influence each other</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Color Palette Display */}
        <div style={{ marginTop: 32 }}>
          <Title level={4}>Color Palette Preview</Title>
          <div style={{ 
            display: 'flex', 
            gap: 2, 
            marginTop: 16, 
            borderRadius: 8, 
            overflow: 'hidden',
            overflowX: 'auto',
            minHeight: 100,
            padding: '0 2px'
          }}>
            {palette.map(({ shade, color }) => (
              <div
                key={shade}
                style={{
                  backgroundColor: color,
                  height: 100,
                  minWidth: palette.length > 15 ? 60 : 'auto',
                  flex: palette.length <= 15 ? 1 : 'none',
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
                  position: 'relative',
                  whiteSpace: 'nowrap'
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
          
          <div style={{ marginTop: 16 }}>
            <Slider 
              range 
              step={50}  
              min={0}
              max={2100}
              value={[minRange, maxRange]}
              onChange={([min, max]) => {
                setMinRange(min);
                setMaxRange(max);
              }}
              tooltip={{
                formatter: (value) => `${value}`
              }}
              style={{ marginTop: 8 }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#666',
              marginTop: 4
            }}>
              <span>0</span>
              <span>Current: {minRange} - {maxRange}</span>
              <span>2100</span>
            </div>
          </div>
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