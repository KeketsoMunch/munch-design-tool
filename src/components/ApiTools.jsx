import React, { useState } from 'react';
import { Card, Typography, Input, Button, Space, Divider, Alert } from 'antd';
import { ApiOutlined, CopyOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ApiTools = () => {
  const [apiEndpoint, setApiEndpoint] = useState('https://api.example.com/palette');
  const [response, setResponse] = useState('');

  const sampleResponse = `{
  "palette": {
    "name": "navy",
    "colors": {
      "50": "#f0f4ff",
      "100": "#e0e7ff",
      "200": "#c7d2fe",
      "300": "#a5b4fc",
      "400": "#818cf8",
      "500": "#6366f1",
      "600": "#4f46e5",
      "700": "#4338ca",
      "800": "#3730a3",
      "900": "#312e81",
      "950": "#1e1b4b"
    }
  }
}`;

  const handleApiCall = () => {
    // Simulate API call
    setTimeout(() => {
      setResponse(sampleResponse);
    }, 1000);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <ApiOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2}>Palette API</Title>
          <Paragraph>
            Any set of Palettes can be fetched via an API. You may find this useful for design tools
            that need to generate a 50-950 Palette from just a single Hex value.
          </Paragraph>
        </div>

        <Alert
          message="API Information"
          description="Currently, the API will only return a Palette using the base hex value, with no options to have HSL tweaks."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <div style={{ marginBottom: 24 }}>
          <Title level={4}>API Endpoint</Title>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              placeholder="Enter API endpoint"
            />
            <Button type="primary" onClick={handleApiCall}>
              Test API
            </Button>
          </Space.Compact>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Title level={4}>Example Request</Title>
          <TextArea
            value={`GET ${apiEndpoint}?color=1E4BCD&name=navy`}
            rows={2}
            style={{ fontFamily: 'monospace' }}
            readOnly
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Title level={4} style={{ margin: 0 }}>Response</Title>
            <Button 
              size="small" 
              icon={<CopyOutlined />}
              onClick={() => navigator.clipboard.writeText(response)}
              disabled={!response}
            >
              Copy
            </Button>
          </div>
          <TextArea
            value={response}
            rows={15}
            style={{ fontFamily: 'monospace' }}
            placeholder="API response will appear here after testing..."
            readOnly
          />
        </div>

        <Divider />

        <div>
          <Title level={4}>Usage Examples</Title>
          <div style={{ marginBottom: 16 }}>
            <Text strong>JavaScript Fetch:</Text>
            <TextArea
              value={`fetch('${apiEndpoint}?color=1E4BCD&name=navy')
  .then(response => response.json())
  .then(data => console.log(data));`}
              rows={3}
              style={{ fontFamily: 'monospace', marginTop: 8 }}
              readOnly
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong>cURL:</Text>
            <TextArea
              value={`curl -X GET "${apiEndpoint}?color=1E4BCD&name=navy" \\
  -H "Accept: application/json"`}
              rows={2}
              style={{ fontFamily: 'monospace', marginTop: 8 }}
              readOnly
            />
          </div>
        </div>

        <Alert
          message="Rate Limiting"
          description="This API is rate limited to 100 requests per minute per IP address. For higher usage, please contact us about enterprise options."
          type="warning"
          showIcon
          style={{ marginTop: 24 }}
        />
      </Card>
    </div>
  );
};

export default ApiTools;