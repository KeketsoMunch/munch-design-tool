import React from 'react';
import { Layout, Menu, Typography, Button, Space } from 'antd';
import { 
  RadiusSettingOutlined, 
  BgColorsOutlined, 
  ApiOutlined,
  EyeOutlined,
  AppstoreOutlined,
  GithubOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const Navigation = ({ currentPage, onPageChange }) => {
  const menuItems = [
    {
      key: 'radius',
      icon: <RadiusSettingOutlined />,
      label: 'Border Radius',
    },
    {
      key: 'palette',
      icon: <BgColorsOutlined />,
      label: 'Color Palette',
    },
    {
      key: 'tokens',
      icon: <EyeOutlined />,
      label: 'Design Tokens',
    },
    {
      key: 'components',
      icon: <AppstoreOutlined />,
      label: 'Components',
    },
  ];

  return (
    <Header 
      style={{ 
        background: '#fff', 
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title 
          level={4} 
          style={{ 
            margin: 0, 
            marginRight: 32,
            color: '#1890ff',
            fontWeight: 600
          }}
        >
          Munch Design Tools
        </Title>
        <Menu
          mode="horizontal"
          selectedKeys={[currentPage]}
          onClick={({ key }) => onPageChange(key)}
          items={menuItems}
          style={{ 
            border: 'none',
            minWidth: 400
          }}
        />
      </div>
      
      <Space>
        <Button 
          type="text" 
          icon={<StarOutlined />}
          style={{ color: '#faad14' }}
        >
          1121
        </Button>
        <Button 
          type="text" 
          icon={<GithubOutlined />}
          href="https://github.com"
          target="_blank"
        />
      </Space>
    </Header>
  );
};

export default Navigation;