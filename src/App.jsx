import { useState } from 'react';
import './App.css';
import { Layout } from 'antd';
import RadiusVisualizer from './components/RadiusVisualizer';
import ColorPalette from './components/ColorPalette';
import ApiTools from './components/ApiTools';
import APCAContrast from './components/APCAContrast';
import Components from './components/Components';
import Navigation from './components/Navigation';

const { Content } = Layout;

function App() {
  const [currentPage, setCurrentPage] = useState('radius');

  const renderContent = () => {
    switch (currentPage) {
      case 'radius':
        return (
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
            <RadiusVisualizer />
          </div>
        );
      case 'palette':
        return <ColorPalette />;
      case 'api':
        return <ApiTools />;
      case 'apca':
        return <APCAContrast />;
      case 'components':
        return <Components />;
      default:
        return (
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
            <RadiusVisualizer />
          </div>
        );
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <Content>
        {renderContent()}
      </Content>
    </Layout>
  );
}

export default App;
