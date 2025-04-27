import React from 'react';
import { TreeProvider } from './context/TreeContext';
import NodeTree from './components/NodeTree';

function App() {
  return (
    <TreeProvider>
      <NodeTree />
    </TreeProvider>
  );
}

export default App;