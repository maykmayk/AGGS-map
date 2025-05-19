import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Map from './components/Map';
import AddWaypoint from './components/AddWaypoint';
import WaypointList from './components/WaypointList';
import MobileCheck from './components/MobileCheck';

function App() {
  return (
    <Router>
      <div className="h-screen flex flex-col">
        <MobileCheck />
        <Toaster position="top-center" />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Map />} />
            <Route path="/add" element={<AddWaypoint />} />
            <Route path="/list" element={<WaypointList />} />
          </Routes>
        </main>
        <Navbar />
      </div>
    </Router>
  );
}

export default App;