import React from 'react';
import { createRoot } from 'react-dom/client';
import Lanyard from './components/Lanyard/Lanyard.jsx';

const mountNode = document.getElementById('lanyard-root');

if (mountNode) {
  createRoot(mountNode).render(
    <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
  );
}
