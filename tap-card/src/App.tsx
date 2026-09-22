import { useState, useCallback, useEffect } from 'react';
import { ConfigProvider, useConfig } from './store';
import { generateCardHtml } from './utils/generateCard';
import Configurator from './components/Configurator';
import CardPreview from './components/CardPreview';
import './App.css';

function AppInner() {
  const { config } = useConfig();
  const [cardHtml, setCardHtml] = useState<string | null>(null);

  useEffect(() => {
    const html = generateCardHtml(config);
    setCardHtml(html);
  }, [config]);

  const handleDownload = useCallback(() => {
    if (!cardHtml) return;
    const blob = new Blob([cardHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tap-card.html';
    a.click();
    URL.revokeObjectURL(url);
  }, [cardHtml]);

  return (
    <div className="app">
      <Configurator onDownload={handleDownload} hasPreview={!!cardHtml} />
      <CardPreview html={cardHtml} />
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AppInner />
    </ConfigProvider>
  );
}
