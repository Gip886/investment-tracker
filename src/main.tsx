import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { unstableSetRender } from 'antd-mobile'
import './index.css'
import App from './App.tsx'

// antd-mobile v5 兼容 React 19
unstableSetRender((node, container) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = container as any;
  c._reactRoot ||= createRoot(container);
  const root = c._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
