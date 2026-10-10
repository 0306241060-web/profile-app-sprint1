import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Notes from './Notes';
import PrivateNotes from './PrivateNotes';
import Settings from './Settings';
import { AppProvider } from './AppContext';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/notes" replace />} />
            <Route path="notes" element={<Notes />} />
            <Route path="private" element={<PrivateNotes />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/notes" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
