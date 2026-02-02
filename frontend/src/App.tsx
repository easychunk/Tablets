import { Link, Route, Routes } from "react-router-dom";
import DoorPage from "./pages/Door";
import EntrancePage from "./pages/Entrance";
import TvPage from "./pages/Tv";
import AdminPage from "./pages/Admin/Admin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/door/:roomId" element={<DoorPage />} />
      <Route path="/entrance" element={<EntrancePage />} />
      <Route path="/tv" element={<TvPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

function Home() {
  return (
    <div className="container">
      <h1>School Displays</h1>
      <div className="grid grid-2">
        <div className="card">
          <h2>Door</h2>
          <p>Room kiosk display.</p>
          <Link to="/door/1">Open room 1</Link>
        </div>
        <div className="card">
          <h2>Entrance</h2>
          <p>NFC check-in screen.</p>
          <Link to="/entrance">Open entrance</Link>
        </div>
        <div className="card">
          <h2>TV</h2>
          <p>Schedule rotation + video.</p>
          <Link to="/tv">Open TV</Link>
        </div>
        <div className="card">
          <h2>Admin</h2>
          <p>Manage data and media.</p>
          <Link to="/admin">Open admin</Link>
        </div>
      </div>
    </div>
  );
}
