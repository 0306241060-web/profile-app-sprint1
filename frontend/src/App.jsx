import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Notes from './Notes';
import PrivateNotes from './PrivateNotes'; // 1. Import trang mới[cite: 12]
import Settings from './Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="notes" element={<Notes />} />
        <Route path="private" element={<PrivateNotes />} /> {/* 2. Gán component PrivateNotes */}
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;