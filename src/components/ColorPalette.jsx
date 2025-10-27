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
  const [selectedPreset, setSelectedPreset] = useState('balanced');
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

  // Catmull-Rom spline interpolation for smooth curves through all points
  const catmullRomSpline = (points, t) => {
    const p0 = points[0];
    const p1 = points[1];
    const p2 = points[2];
    const p3 = points[3];

    const t2 = t * t;
    const t3 = t2 * t;

    return {
      x: 0.5 * ((2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: 0.5 * ((2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
    };
  };

  // Generate lightness for a given shade using spline interpolation through palette points
  const generateLightnessCurve = (shade, palettePoints) => {
    if (!palettePoints || palettePoints.length === 0) return 50;

    const sortedPoints = [...palettePoints].sort((a, b) => a.shade - b.shade);

    // If shade is outside range, clamp to edges
    if (shade <= sortedPoints[0].shade) return sortedPoints[0].lightness;
    if (shade >= sortedPoints[sortedPoints.length - 1].shade) return sortedPoints[sortedPoints.length - 1].lightness;

    // Find surrounding points for interpolation
    let leftIdx = 0;
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      if (shade >= sortedPoints[i].shade && shade <= sortedPoints[i + 1].shade) {
        leftIdx = i;
        break;
      }
    }

    // Get 4 points for Catmull-Rom (handle edge cases)
    const p0 = sortedPoints[Math.max(0, leftIdx - 1)];
    const p1 = sortedPoints[leftIdx];
    const p2 = sortedPoints[Math.min(sortedPoints.length - 1, leftIdx + 1)];
    const p3 = sortedPoints[Math.min(sortedPoints.length - 1, leftIdx + 2)];

    // Calculate t (0 to 1 between p1 and p2)
    const t = (shade - p1.shade) / (p2.shade - p1.shade);

    // Use spline interpolation
    const points = [
      { x: p0.shade, y: p0.lightness },
      { x: p1.shade, y: p1.lightness },
      { x: p2.shade, y: p2.lightness },
      { x: p3.shade, y: p3.lightness }
    ];

    const result = catmullRomSpline(points, t);
    return Math.max(0, Math.min(100, result.y));
  };

  // Initialize palette with lightness values based on preset curve
  const [palettePoints, setPalettePoints] = useState(() => {
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    return shades.map((shade, idx) => ({
      shade,
      lightness: 95 - (idx / (shades.length - 1)) * 90 // Linear distribution 95 to 5
    }));
  });

  // Generate color palette based on palette points
  const generatePalette = () => {
    // Get base HSL from hex
    const [baseH, baseS, baseL] = hexToHsl(baseColor);

    return palettePoints.map(point => {
      // Apply adjustments
      const adjustedHue = (baseH + hue + 360) % 360;
      const adjustedSaturation = Math.max(0, Math.min(100, baseS + saturation));
      const finalLightness = Math.max(lightnessMin, Math.min(lightnessMax, point.lightness));
      const color = hslToHex(adjustedHue, adjustedSaturation, finalLightness);

      return {
        shade: point.shade,
        color,
        lightness: finalLightness
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
        palettePoints,
        curveIntensity,
        connectionStrength
      })
    };
    
    palette.forEach(({ shade, color }) => {
      paletteObject.colors[shade] = color;
    });
    
    return JSON.stringify(paletteObject, null, 2);
  };

  // Palette point interaction handlers
  const handlePointDrag = (index, newShade, newLightness) => {
    const newPoints = [...palettePoints];

    // Update only the lightness of the dragged point
    newPoints[index] = {
      ...newPoints[index],
      lightness: Math.max(0, Math.min(100, newLightness))
    };

    setPalettePoints(newPoints);
    setSelectedPreset('custom');
  };

  const addPalettePoint = () => {
    // Find a gap in the existing shades to insert new point
    const sortedPoints = [...palettePoints].sort((a, b) => a.shade - b.shade);

    // Find the largest gap
    let maxGap = 0;
    let insertShade = 500;
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const gap = sortedPoints[i + 1].shade - sortedPoints[i].shade;
      if (gap > maxGap) {
        maxGap = gap;
        insertShade = Math.round((sortedPoints[i].shade + sortedPoints[i + 1].shade) / 2);
      }
    }

    // Calculate lightness using spline interpolation
    const newLightness = generateLightnessCurve(insertShade, palettePoints);

    setPalettePoints([...palettePoints, { shade: insertShade, lightness: newLightness }]);
    setSelectedPreset('custom');
    message.success(`Added point at shade ${insertShade}`);
  };

  const removePalettePoint = (index) => {
    if (palettePoints.length > 2) {
      const newPoints = palettePoints.filter((_, i) => i !== index);
      setPalettePoints(newPoints);
      setSelectedPreset('custom');
    } else {
      message.warning('Minimum 2 points required');
    }
  };

  // Preset curve configurations - generate lightness distributions
  const curvePresets = {
    linear: {
      name: 'Linear',
      generate: (points) => points.map((p, i, arr) => ({
        ...p,
        lightness: 95 - (i / (arr.length - 1)) * 90
      }))
    },
    easeIn: {
      name: 'Ease In',
      generate: (points) => points.map((p, i, arr) => {
        const t = i / (arr.length - 1);
        const easedT = Math.pow(t, 2);
        return { ...p, lightness: 95 - easedT * 90 };
      })
    },
    easeOut: {
      name: 'Ease Out',
      generate: (points) => points.map((p, i, arr) => {
        const t = i / (arr.length - 1);
        const easedT = 1 - Math.pow(1 - t, 2);
        return { ...p, lightness: 95 - easedT * 90 };
      })
    },
    sCurve: {
      name: 'S-Curve',
      generate: (points) => points.map((p, i, arr) => {
        const t = i / (arr.length - 1);
        const easedT = t < 0.5
          ? 2 * t * t
          : 1 - Math.pow(-2 * t + 2, 2) / 2;
        return { ...p, lightness: 95 - easedT * 90 };
      })
    },
    balanced: {
      name: 'Balanced',
      generate: (points) => points.map((p, i, arr) => ({
        ...p,
        lightness: 95 - (i / (arr.length - 1)) * 90
      }))
    },
    dramatic: {
      name: 'Dramatic',
      generate: (points) => points.map((p, i, arr) => {
        const t = i / (arr.length - 1);
        const easedT = Math.pow(t, 3);
        return { ...p, lightness: 98 - easedT * 95 };
      })
    },
    subtle: {
      name: 'Subtle',
      generate: (points) => points.map((p, i, arr) => {
        const t = i / (arr.length - 1);
        return { ...p, lightness: 90 - t * 75 };
      })
    }
  };

  const applyPreset = (presetKey) => {
    const preset = curvePresets[presetKey];
    if (preset) {
      const newPoints = preset.generate(palettePoints);
      setPalettePoints(newPoints);
      setSelectedPreset(presetKey);
      message.success(`Applied ${preset.name} preset`);
    }
  };

  const resetGraph = () => {
    applyPreset('balanced');
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
        
        if (data.palettePoints) {
          setPalettePoints(data.palettePoints);
        } else if (data.graphPoints) {
          // Backward compatibility
          setPalettePoints(data.graphPoints);
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
              <Text strong>Palette: {palettePoints.length} colors</Text>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                Use Add/Remove buttons in graph section to manage colors
              </Text>
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

                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Preset Curves</Text>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
                      {Object.entries(curvePresets).map(([key, preset]) => (
                        <Button
                          key={key}
                          size="small"
                          type={selectedPreset === key ? 'primary' : 'default'}
                          onClick={() => applyPreset(key)}
                          style={{ fontSize: '11px', padding: '2px 8px' }}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong>Palette Points ({palettePoints.length})</Text>
                    <Space>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={addPalettePoint}
                        disabled={palettePoints.length >= 20}
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
                <defs>
                  {/* Create gradient background using palette colors */}
                  <linearGradient id="paletteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    {palette.map((item, index) => (
                      <stop
                        key={index}
                        offset={`${(index / (palette.length - 1)) * 100}%`}
                        stopColor={item.color}
                      />
                    ))}
                  </linearGradient>

                  {/* Hue gradient for bottom preview */}
                  <linearGradient id="hueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    {palette.map((item, index) => (
                      <stop
                        key={index}
                        offset={`${(item.shade / 2100) * 100}%`}
                        stopColor={item.color}
                      />
                    ))}
                  </linearGradient>
                </defs>

                {/* Color gradient background */}
                <rect x="50" y="50" width="700" height="200" fill="url(#paletteGradient)" opacity="0.9" rx="4" />
                
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
                
                {/* Smooth curve through all palette points using spline interpolation */}
                <path
                  d={(() => {
                    const sorted = [...palettePoints].sort((a, b) => a.shade - b.shade);
                    const pathPoints = [];

                    // Generate smooth curve through all points
                    for (let i = 0; i < sorted.length - 1; i++) {
                      const p0 = sorted[Math.max(0, i - 1)];
                      const p1 = sorted[i];
                      const p2 = sorted[i + 1];
                      const p3 = sorted[Math.min(sorted.length - 1, i + 2)];

                      // Generate curve segment between p1 and p2
                      const steps = 20;
                      for (let step = 0; step <= steps; step++) {
                        const t = step / steps;
                        const splinePoints = [
                          { x: p0.shade, y: p0.lightness },
                          { x: p1.shade, y: p1.lightness },
                          { x: p2.shade, y: p2.lightness },
                          { x: p3.shade, y: p3.lightness }
                        ];
                        const result = catmullRomSpline(splinePoints, t);
                        const x = 50 + (result.x / 2100) * 700;
                        const y = 250 - (result.y / 100) * 200;
                        pathPoints.push(`${pathPoints.length === 0 ? 'M' : 'L'} ${x} ${y}`);
                      }
                    }

                    return pathPoints.join(' ');
                  })()}
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  opacity="0.9"
                />

                {/* Palette color dots - show actual colors at their positions */}
                {palette.map((item, idx) => {
                  const x = 50 + (item.shade / 2100) * 700;
                  const y = 250 - (item.lightness / 100) * 200;
                  return (
                    <circle
                      key={`palette-${idx}`}
                      cx={x}
                      cy={y}
                      r="5"
                      fill={item.color}
                      stroke="white"
                      strokeWidth="2.5"
                      opacity="1"
                    />
                  );
                })}
                
                {/* Interactive control points - each represents a palette color */}
                {palettePoints.map((point, index) => {
                  const x = 50 + (point.shade / 2100) * 700;
                  const y = 250 - (point.lightness / 100) * 200;

                  return (
                    <g key={index}>
                      {/* Outer ring for better visibility */}
                      <circle
                        cx={x}
                        cy={y}
                        r="12"
                        fill="rgba(255, 77, 79, 0.3)"
                        stroke="white"
                        strokeWidth="3"
                      />
                      {/* Inner control point */}
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill="#ff4d4f"
                        stroke="white"
                        strokeWidth="3"
                        style={{ cursor: 'move' }}
                        onMouseDown={(e) => {
                          const svg = e.currentTarget.closest('svg');
                          const rect = svg.getBoundingClientRect();
                          
                          const handleMouseMove = (moveEvent) => {
                            const newX = moveEvent.clientX - rect.left;
                            const newY = moveEvent.clientY - rect.top;
                            
                            const newShade = Math.max(0, Math.min(2100, ((newX - 50) / 700) * 2100));
                            const newLightness = Math.max(0, Math.min(100, ((250 - newY) / 200) * 100));
                            
                            handlePointDrag(index, newShade, newLightness);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      />
                      {/* Label background for better readability */}
                      <rect
                        x={x - 30}
                        y={y - 28}
                        width="60"
                        height="16"
                        fill="rgba(0, 0, 0, 0.75)"
                        rx="3"
                        pointerEvents="none"
                      />
                      <text
                        x={x}
                        y={y - 16}
                        textAnchor="middle"
                        fontSize="10"
                        fill="white"
                        fontWeight="600"
                        pointerEvents="none"
                      >
                        {Math.round(point.shade)}, {Math.round(point.lightness)}%
                      </text>
                      {palettePoints.length > 2 && (
                        <>
                          <circle
                            cx={x + 16}
                            cy={y - 16}
                            r="8"
                            fill="#ff4d4f"
                            stroke="white"
                            strokeWidth="2"
                            style={{ cursor: 'pointer' }}
                            onClick={() => removePalettePoint(index)}
                          />
                          <text
                            x={x + 16}
                            y={y - 12}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="white"
                            pointerEvents="none"
                          >
                            ×
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Horizontal palette preview bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{
                  height: 40,
                  borderRadius: 8,
                  background: 'linear-gradient(to right, ' + palette.map(item => item.color).join(', ') + ')',
                  border: '2px solid #e1e1e1',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                </div>
              </div>

              <div style={{ marginTop: 32, fontSize: '12px', color: '#666' }}>
                <Text strong>Instructions:</Text>
                <ul style={{ margin: '8px 0', paddingLeft: 16 }}>
                  <li>The colored gradient background shows your actual palette</li>
                  <li>Each colored dot represents a palette color - drag up/down to adjust lightness</li>
                  <li>Red control points (same as colored dots) can be moved vertically to change that color</li>
                  <li>The white curve shows the smooth interpolation through all points</li>
                  <li>Use preset curves to redistribute all colors along different patterns</li>
                  <li>Add/remove points to create more or fewer colors in your palette</li>
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