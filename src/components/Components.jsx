import React, { useState } from 'react';
import { Card, Typography, Row, Col, Space, Select, Switch, Divider } from 'antd';
import { 
  HomeOutlined, 
  UserOutlined, 
  SettingOutlined, 
  BellOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  StarOutlined,
  HeartOutlined
} from '@ant-design/icons';
import flatTokens from '../data/system-studio-semantics-flat.json';

const { Title, Text } = Typography;
const { Option } = Select;

// Reusable Icon Component
const IconComponent = ({ 
  icon: IconElement, 
  size = 'medium', 
  variant = 'primary',
  state = 'base',
  style = {},
  className = '',
  ...props 
}) => {
  // Size mapping
  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32
  };

  // Get color from flat tokens
  const getTokenColor = (tokenPath) => {
    const key = `--system-${tokenPath.replace(/\./g, '-').toLowerCase()}`;
    return flatTokens[key] || '#000000';
  };

  // Color variant mapping
  const getIconColor = () => {
    const colorKey = `fg-${variant}${state !== 'base' ? `-${state}` : ''}`;
    return getTokenColor(colorKey);
  };

  const iconSize = sizeMap[size];
  const iconColor = getIconColor();

  return (
    <span 
      className={`icon-component ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
        fontSize: iconSize,
        lineHeight: 1,
        ...style
      }}
      {...props}
    >
      <IconElement style={{ fontSize: iconSize, color: iconColor }} />
    </span>
  );
};

const Components = () => {
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedVariant, setSelectedVariant] = useState('primary');
  const [selectedState, setSelectedState] = useState('base');
  const [showSpecs, setShowSpecs] = useState(false);

  // Available icons for demonstration
  const demoIcons = [
    { name: 'Home', icon: HomeOutlined },
    { name: 'User', icon: UserOutlined },
    { name: 'Settings', icon: SettingOutlined },
    { name: 'Bell', icon: BellOutlined },
    { name: 'Search', icon: SearchOutlined },
    { name: 'Plus', icon: PlusOutlined },
    { name: 'Edit', icon: EditOutlined },
    { name: 'Delete', icon: DeleteOutlined },
    { name: 'Download', icon: DownloadOutlined },
    { name: 'Upload', icon: UploadOutlined },
    { name: 'Star', icon: StarOutlined },
    { name: 'Heart', icon: HeartOutlined }
  ];

  // Available variants based on flat tokens
  const variants = [
    'primary',
    'secondary', 
    'tertiary',
    'neutral-solid',
    'neutral-soft',
    'light-solid',
    'light-soft',
    'control-primary-solid',
    'control-primary-soft',
    'control-secondary-solid',
    'control-secondary-soft',
    'control-tertiary-solid',
    'control-tertiary-soft',
    'disabled',
    'placeholder',
    'dark'
  ];

  const states = ['base', 'hover', 'focus'];
  const sizes = ['small', 'medium', 'large', 'xlarge'];

  // Get token color for display
  const getTokenColor = (tokenPath) => {
    const key = `--system-${tokenPath.replace(/\./g, '-').toLowerCase()}`;
    return flatTokens[key] || '#000000';
  };

  const getCurrentTokenKey = () => {
    return `fg-${selectedVariant}${selectedState !== 'base' ? `-${selectedState}` : ''}`;
  };

  const getCurrentColor = () => {
    return getTokenColor(getCurrentTokenKey());
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>Component Library</Title>
          <Text type="secondary">
            Reusable components built with design tokens for consistent styling across the application.
          </Text>
        </div>

        {/* Icon Component Section */}
        <div style={{ marginBottom: 48 }}>
          <Title level={3}>Icon Component</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            A flexible icon component that automatically applies design tokens based on variant, state, and size.
          </Text>

          {/* Controls */}
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col span={6}>
              <Text strong>Size:</Text>
              <Select 
                value={selectedSize} 
                onChange={setSelectedSize}
                style={{ width: '100%', marginTop: 8 }}
              >
                {sizes.map(size => (
                  <Option key={size} value={size}>
                    {size.charAt(0).toUpperCase() + size.slice(1)} 
                    ({size === 'small' ? '16px' : size === 'medium' ? '20px' : size === 'large' ? '24px' : '32px'})
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Text strong>Variant:</Text>
              <Select 
                value={selectedVariant} 
                onChange={setSelectedVariant}
                style={{ width: '100%', marginTop: 8 }}
              >
                {variants.map(variant => (
                  <Option key={variant} value={variant}>
                    {variant.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Text strong>State:</Text>
              <Select 
                value={selectedState} 
                onChange={setSelectedState}
                style={{ width: '100%', marginTop: 8 }}
              >
                {states.map(state => (
                  <Option key={state} value={state}>
                    {state.charAt(0).toUpperCase() + state.slice(1)}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text strong>Show Specs:</Text>
                <Switch 
                  checked={showSpecs}
                  onChange={setShowSpecs}
                />
              </div>
            </Col>
          </Row>

          {/* Current Token Info */}
          <Card size="small" style={{ marginBottom: 24, backgroundColor: '#f8f9fa' }}>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Text strong>Current Token:</Text>
                <br />
                <Text code>{getCurrentTokenKey()}</Text>
              </Col>
              <Col span={8}>
                <Text strong>Resolved Color:</Text>
                <br />
                <Space>
                  <div 
                    style={{ 
                      width: 20, 
                      height: 20, 
                      backgroundColor: getCurrentColor(),
                      border: '1px solid #d9d9d9',
                      borderRadius: 4
                    }} 
                  />
                  <Text code>{getCurrentColor()}</Text>
                </Space>
              </Col>
              <Col span={8}>
                <Text strong>CSS Variable:</Text>
                <br />
                <Text code>--system-{getCurrentTokenKey().replace(/\./g, '-')}</Text>
              </Col>
            </Row>
          </Card>

          {/* Icon Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
            gap: 16,
            marginBottom: 32
          }}>
            {demoIcons.map(({ name, icon }) => (
              <Card 
                key={name}
                size="small" 
                style={{ 
                  textAlign: 'center',
                  minHeight: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <IconComponent 
                    icon={icon}
                    size={selectedSize}
                    variant={selectedVariant}
                    state={selectedState}
                  />
                </div>
                <Text style={{ fontSize: '12px' }}>{name}</Text>
                {showSpecs && (
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: '10px' }}>
                      {selectedSize} • {getCurrentColor()}
                    </Text>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Divider />

          {/* Usage Examples */}
          <Title level={4}>Usage Examples</Title>
          
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card size="small">
                <Title level={5}>Basic Usage</Title>
                <pre style={{ 
                  backgroundColor: '#f6f8fa', 
                  padding: 16, 
                  borderRadius: 6,
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
{`import { IconComponent } from './components/IconComponent';
import { HomeOutlined } from '@ant-design/icons';

// Basic icon
<IconComponent 
  icon={HomeOutlined} 
  size="medium" 
  variant="primary" 
/>

// Icon with hover state
<IconComponent 
  icon={HomeOutlined} 
  size="large" 
  variant="control-primary-solid"
  state="hover"
/>`}
                </pre>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card size="small">
                <Title level={5}>Advanced Usage</Title>
                <pre style={{ 
                  backgroundColor: '#f6f8fa', 
                  padding: 16, 
                  borderRadius: 6,
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
{`// Custom styling
<IconComponent 
  icon={SettingOutlined}
  size="xlarge"
  variant="neutral-solid"
  state="focus"
  style={{ margin: '8px' }}
  className="custom-icon"
/>

// Interactive icon
<IconComponent 
  icon={StarOutlined}
  size="medium"
  variant="control-primary-soft"
  onClick={handleClick}
  style={{ cursor: 'pointer' }}
/>`}
                </pre>
              </Card>
            </Col>
          </Row>

          <Divider />

          {/* Component Specifications */}
          <Title level={4}>Component Specifications</Title>
          
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card size="small">
                <Title level={5}>Props</Title>
                <div style={{ fontSize: '12px' }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>icon</Text> <Text type="secondary">(required)</Text>
                    <br />
                    <Text type="secondary">Ant Design icon component</Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>size</Text> <Text type="secondary">('small' | 'medium' | 'large' | 'xlarge')</Text>
                    <br />
                    <Text type="secondary">Default: 'medium'</Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>variant</Text> <Text type="secondary">(string)</Text>
                    <br />
                    <Text type="secondary">Token variant (e.g., 'primary', 'control-primary-solid')</Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>state</Text> <Text type="secondary">('base' | 'hover' | 'focus')</Text>
                    <br />
                    <Text type="secondary">Default: 'base'</Text>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col span={8}>
              <Card size="small">
                <Title level={5}>Sizes</Title>
                <div style={{ fontSize: '12px' }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>small:</Text> <Text>16px</Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>medium:</Text> <Text>20px</Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>large:</Text> <Text>24px</Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>xlarge:</Text> <Text>32px</Text>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col span={8}>
              <Card size="small">
                <Title level={5}>Token Mapping</Title>
                <div style={{ fontSize: '12px' }}>
                  <Text type="secondary">
                    Colors are automatically resolved from design tokens using the pattern:
                  </Text>
                  <br />
                  <Text code style={{ fontSize: '11px' }}>
                    --system-fg-{'{variant}'}-{'{state}'}
                  </Text>
                  <br />
                  <br />
                  <Text type="secondary">
                    Example: variant="primary" + state="hover" resolves to --system-fg-primary-hover
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default Components;