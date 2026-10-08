import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Settings from './Settings';
import Notes from './Notes';
function Home() { return <h2>Trang chủ</h2>; }
function Private() { return <h2>Vùng kín</h2>; }

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="notes" element={<Notes />} /> {/* Thêm route cho Sprint 2 */}
          <Route path="settings" element={<Settings />} />
          <Route path="private" element={<Private />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;