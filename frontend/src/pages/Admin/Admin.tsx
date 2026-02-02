import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch, getApiUrl, resolveUrl } from "../../api";
import logo from "../../assets/logo.png";

type Room = { id: number; name: string; location?: string | null; is_active: boolean };
type ClassGroup = { id: number; name: string; is_active: boolean };
type Student = { id: number; full_name: string; class_id: number; nfc_uid: string; is_active: boolean };
type TimetableEntry = {
  id: number;
  weekday: number;
  class_id: number;
  room_id: number;
  lesson_number: number;
  title: string;
};
type MediaItem = { id: number; filename: string; url: string; is_active: boolean; created_at: string };
type CheckinItem = {
  id: number;
  arrival_at: string;
  status: string;
  late_by_minutes: number;
  nfc_uid: string;
  student: { id: number; full_name: string; class_id: number } | null;
  device_id: number;
};

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("admin_token"));

  if (!token) {
    return <Login onToken={(t) => setToken(t)} />;
  }

  return <Dashboard onLogout={() => setToken(null)} />;
}

function Login({ onToken }: { onToken: (token: string) => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await apiFetch<{ access_token: string }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("admin_token", response.access_token);
      onToken(response.access_token);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="container">
      <h1>Admin Login</h1>
      <form onSubmit={submit} className="card" style={{ maxWidth: 420 }}>
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div style={{ marginTop: 12 }}>
          <button type="submit">Login</button>
        </div>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "rooms" | "classes" | "students" | "timetable" | "media" | "analytics"
  >("dashboard");

  const [roomForm, setRoomForm] = useState({ name: "", location: "" });
  const [roomUpdate, setRoomUpdate] = useState({ id: "", name: "", location: "", is_active: true });
  const [roomDeleteId, setRoomDeleteId] = useState("");

  const [classForm, setClassForm] = useState({ name: "" });
  const [classUpdate, setClassUpdate] = useState({ id: "", name: "", is_active: true });
  const [classDeleteId, setClassDeleteId] = useState("");

  const [studentForm, setStudentForm] = useState({ full_name: "", class_id: "", nfc_uid: "" });
  const [studentUpdate, setStudentUpdate] = useState({
    id: "",
    full_name: "",
    class_id: "",
    nfc_uid: "",
    is_active: true,
  });
  const [studentDeleteId, setStudentDeleteId] = useState("");

  const [timetableForm, setTimetableForm] = useState({
    weekday: "1",
    class_id: "",
    room_id: "",
    lesson_number: "1",
    title: "",
  });
  const [timetableDeleteId, setTimetableDeleteId] = useState("");

  const [analyticsFilters, setAnalyticsFilters] = useState({
    date: "",
    class_id: "",
    student_id: "",
    status: "",
  });

  const loadAll = async () => {
    const [roomsData, classesData, studentsData, mediaData] = await Promise.all([
      apiFetch<Room[]>("/api/admin/rooms", {}, true),
      apiFetch<ClassGroup[]>("/api/admin/classes", {}, true),
      apiFetch<Student[]>("/api/admin/students", {}, true),
      apiFetch<MediaItem[]>("/api/admin/media", {}, true),
    ]);
    setRooms(roomsData);
    setClasses(classesData);
    setStudents(studentsData);
    setMedia(mediaData);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    onLogout();
  };

  const submitRoom = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetch("/api/admin/rooms", {
      method: "POST",
      body: JSON.stringify({ name: roomForm.name, location: roomForm.location || null }),
    }, true);
    setRoomForm({ name: "", location: "" });
    await loadAll();
  };

  const submitRoomUpdate = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetch(`/api/admin/rooms/${roomUpdate.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: roomUpdate.name || undefined,
        location: roomUpdate.location || undefined,
        is_active: roomUpdate.is_active,
      }),
    }, true);
    setRoomUpdate({ id: "", name: "", location: "", is_active: true });
    await loadAll();
  };

  const deleteRoom = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetch(`/api/admin/rooms/${roomDeleteId}`, { method: "DELETE" }, true);
    setRoomDeleteId("");
    await loadAll();
  };

  const submitClass = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetch("/api/admin/classes", {
      method: "POST",
      body: JSON.stringify({ name: classForm.name }),
    }, true);
    setClassForm({ name: "" });
    await loadAll();
  };

  const submitClassUpdate = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetch(`/api/admin/classes/${classUpdate.id}`, {
      method: "PUT",
      body: JSON.stringify({ name: classUpdate.name || undefined, is_active: classUpdate.is_active }),
    }, true);
    setClassUpdate({ id: "", name: "", is_active: true });
    await loadAll();
  };

  const deleteClass = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetch(`/api/admin/classes/${classDeleteId}`, { method: "DELETE" }, true);
    setClassDeleteId("");
    await loadAll();
  };

  const submitStudent = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetch("/api/admin/students", {
      method: "POST",
      body: JSON.stringify({
        full_name: studentForm.full_name,
        class_id: Number(studentForm.class_id),
        nfc_uid: studentForm.nfc_uid,
      }),
    }, true);
    setStudentForm({ full_name: "", class_id: "", nfc_uid: "" });
    await loadAll();
  };

  const submitStudentUpdate = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetch(`/api/admin/students/${studentUpdate.id}`, {
      method: "PUT",
      body: JSON.stringify({
        full_name: studentUpdate.full_name || undefined,
        class_id: studentUpdate.class_id ? Number(studentUpdate.class_id) : undefined,
        nfc_uid: studentUpdate.nfc_uid || undefined,
        is_active: studentUpdate.is_active,
      }),
    }, true);
    setStudentUpdate({ id: "", full_name: "", class_id: "", nfc_uid: "", is_active: true });
    await loadAll();
  };

  const deleteStudent = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetch(`/api/admin/students/${studentDeleteId}`, { method: "DELETE" }, true);
    setStudentDeleteId("");
    await loadAll();
  };

  const submitTimetable = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetch("/api/admin/timetable", {
      method: "PUT",
      body: JSON.stringify({
        weekday: Number(timetableForm.weekday),
        class_id: Number(timetableForm.class_id),
        room_id: Number(timetableForm.room_id),
        lesson_number: Number(timetableForm.lesson_number),
        title: timetableForm.title,
      }),
    }, true);
    setTimetableForm({
      weekday: "1",
      class_id: "",
      room_id: "",
      lesson_number: "1",
      title: "",
    });
  };

  const deleteTimetable = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetch(`/api/admin/timetable/${timetableDeleteId}`, { method: "DELETE" }, true);
    setTimetableDeleteId("");
  };

  const uploadMedia = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fileInput = event.currentTarget.elements.namedItem("media_file") as HTMLInputElement | null;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const response = await fetch(getApiUrl("/api/admin/media"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    await loadAll();
    fileInput.value = "";
  };

  const deleteMedia = async (mediaId: number) => {
    await apiFetch(`/api/admin/media/${mediaId}`, { method: "DELETE" }, true);
    await loadAll();
  };

  const runAnalytics = async (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (analyticsFilters.date) params.append("date", analyticsFilters.date);
    if (analyticsFilters.class_id) params.append("class_id", analyticsFilters.class_id);
    if (analyticsFilters.student_id) params.append("student_id", analyticsFilters.student_id);
    if (analyticsFilters.status) params.append("status", analyticsFilters.status);
    const data = await apiFetch<CheckinItem[]>(`/api/admin/checkins?${params.toString()}`, {}, true);
    setCheckins(data);
  };

  const metrics = useMemo(
    () => [
      { label: "Rooms", value: rooms.length },
      { label: "Classes", value: classes.length },
      { label: "Students", value: students.length },
      { label: "Media files", value: media.length },
    ],
    [rooms.length, classes.length, students.length, media.length]
  );

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="brand">
          <div className="brand-logo">
            <img src={logo} alt="Free People School" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div>
            <div>School Display</div>
            <small style={{ color: "#8fa2b5" }}>Administrator</small>
          </div>
        </div>
        <nav className="nav-list">
          <button
            className={`nav-button ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-button ${activeTab === "rooms" ? "active" : ""}`}
            onClick={() => setActiveTab("rooms")}
          >
            Rooms
          </button>
          <button
            className={`nav-button ${activeTab === "classes" ? "active" : ""}`}
            onClick={() => setActiveTab("classes")}
          >
            Classes
          </button>
          <button
            className={`nav-button ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            Students
          </button>
          <button
            className={`nav-button ${activeTab === "timetable" ? "active" : ""}`}
            onClick={() => setActiveTab("timetable")}
          >
            Timetable
          </button>
          <button
            className={`nav-button ${activeTab === "media" ? "active" : ""}`}
            onClick={() => setActiveTab("media")}
          >
            Media
          </button>
          <button
            className={`nav-button ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </nav>
        <div>
          <button className="secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>{activeTab[0].toUpperCase() + activeTab.slice(1)}</h1>
          <span className="tag">Updated: {new Date().toLocaleTimeString()}</span>
        </div>

        {activeTab === "dashboard" && (
          <>
            <div className="metrics" style={{ marginBottom: 20 }}>
              {metrics.map((metric) => (
                <div className="metric-card" key={metric.label}>
                  <h3>{metric.label}</h3>
                  <p>{metric.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-2">
              <div className="card">
                <h2 className="section-title">Quick links</h2>
                <p>Use the sidebar to manage data and media.</p>
              </div>
              <div className="card">
                <h2 className="section-title">Last analytics run</h2>
                <p>{checkins.length ? `${checkins.length} check-ins loaded` : "No data yet"}</p>
              </div>
            </div>
          </>
        )}

        {activeTab === "rooms" && (
          <div className="card">
            <h2 className="section-title">Rooms</h2>
            <div className="grid grid-2">
              <form onSubmit={submitRoom}>
                <label>Name</label>
                <input value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
                <label>Location</label>
                <input value={roomForm.location} onChange={(e) => setRoomForm({ ...roomForm, location: e.target.value })} />
                <button type="submit" style={{ marginTop: 8 }}>
                  Create
                </button>
              </form>
              <form onSubmit={submitRoomUpdate}>
                <label>Room ID</label>
                <input value={roomUpdate.id} onChange={(e) => setRoomUpdate({ ...roomUpdate, id: e.target.value })} />
                <label>Name</label>
                <input value={roomUpdate.name} onChange={(e) => setRoomUpdate({ ...roomUpdate, name: e.target.value })} />
                <label>Location</label>
                <input
                  value={roomUpdate.location}
                  onChange={(e) => setRoomUpdate({ ...roomUpdate, location: e.target.value })}
                />
                <label>Active</label>
                <select
                  value={roomUpdate.is_active ? "true" : "false"}
                  onChange={(e) => setRoomUpdate({ ...roomUpdate, is_active: e.target.value === "true" })}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
                <button type="submit" style={{ marginTop: 8 }}>
                  Update
                </button>
              </form>
            </div>
            <form onSubmit={deleteRoom} style={{ marginTop: 12 }}>
              <label>Delete room by ID</label>
              <input value={roomDeleteId} onChange={(e) => setRoomDeleteId(e.target.value)} />
              <button type="submit" style={{ marginTop: 8 }}>
                Delete
              </button>
            </form>
            <ul>
              {rooms.map((room) => (
                <li key={room.id}>
                  {room.id} — {room.name} ({room.location || "n/a"})
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "classes" && (
          <div className="card">
            <h2 className="section-title">Classes</h2>
            <div className="grid grid-2">
              <form onSubmit={submitClass}>
                <label>Name</label>
                <input value={classForm.name} onChange={(e) => setClassForm({ name: e.target.value })} />
                <button type="submit" style={{ marginTop: 8 }}>
                  Create
                </button>
              </form>
              <form onSubmit={submitClassUpdate}>
                <label>Class ID</label>
                <input value={classUpdate.id} onChange={(e) => setClassUpdate({ ...classUpdate, id: e.target.value })} />
                <label>Name</label>
                <input value={classUpdate.name} onChange={(e) => setClassUpdate({ ...classUpdate, name: e.target.value })} />
                <label>Active</label>
                <select
                  value={classUpdate.is_active ? "true" : "false"}
                  onChange={(e) => setClassUpdate({ ...classUpdate, is_active: e.target.value === "true" })}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
                <button type="submit" style={{ marginTop: 8 }}>
                  Update
                </button>
              </form>
            </div>
            <form onSubmit={deleteClass} style={{ marginTop: 12 }}>
              <label>Delete class by ID</label>
              <input value={classDeleteId} onChange={(e) => setClassDeleteId(e.target.value)} />
              <button type="submit" style={{ marginTop: 8 }}>
                Delete
              </button>
            </form>
            <ul>
              {classes.map((cls) => (
                <li key={cls.id}>
                  {cls.id} — {cls.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "students" && (
          <div className="card">
            <h2 className="section-title">Students</h2>
            <div className="grid grid-2">
              <form onSubmit={submitStudent}>
                <label>Full name</label>
                <input
                  value={studentForm.full_name}
                  onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                />
                <label>Class ID</label>
                <input
                  value={studentForm.class_id}
                  onChange={(e) => setStudentForm({ ...studentForm, class_id: e.target.value })}
                />
                <label>NFC UID</label>
                <input
                  value={studentForm.nfc_uid}
                  onChange={(e) => setStudentForm({ ...studentForm, nfc_uid: e.target.value })}
                />
                <button type="submit" style={{ marginTop: 8 }}>
                  Create
                </button>
              </form>
              <form onSubmit={submitStudentUpdate}>
                <label>Student ID</label>
                <input
                  value={studentUpdate.id}
                  onChange={(e) => setStudentUpdate({ ...studentUpdate, id: e.target.value })}
                />
                <label>Full name</label>
                <input
                  value={studentUpdate.full_name}
                  onChange={(e) => setStudentUpdate({ ...studentUpdate, full_name: e.target.value })}
                />
                <label>Class ID</label>
                <input
                  value={studentUpdate.class_id}
                  onChange={(e) => setStudentUpdate({ ...studentUpdate, class_id: e.target.value })}
                />
                <label>NFC UID</label>
                <input
                  value={studentUpdate.nfc_uid}
                  onChange={(e) => setStudentUpdate({ ...studentUpdate, nfc_uid: e.target.value })}
                />
                <label>Active</label>
                <select
                  value={studentUpdate.is_active ? "true" : "false"}
                  onChange={(e) => setStudentUpdate({ ...studentUpdate, is_active: e.target.value === "true" })}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
                <button type="submit" style={{ marginTop: 8 }}>
                  Update
                </button>
              </form>
            </div>
            <form onSubmit={deleteStudent} style={{ marginTop: 12 }}>
              <label>Delete student by ID</label>
              <input value={studentDeleteId} onChange={(e) => setStudentDeleteId(e.target.value)} />
              <button type="submit" style={{ marginTop: 8 }}>
                Delete
              </button>
            </form>
            <ul>
              {students.map((student) => (
                <li key={student.id}>
                  {student.id} — {student.full_name} (class {student.class_id})
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "timetable" && (
          <div className="card">
            <h2 className="section-title">Timetable</h2>
            <form onSubmit={submitTimetable} className="grid grid-2">
              <div>
                <label>Weekday (1-7)</label>
                <input
                  value={timetableForm.weekday}
                  onChange={(e) => setTimetableForm({ ...timetableForm, weekday: e.target.value })}
                />
              </div>
              <div>
                <label>Class ID</label>
                <input
                  value={timetableForm.class_id}
                  onChange={(e) => setTimetableForm({ ...timetableForm, class_id: e.target.value })}
                />
              </div>
              <div>
                <label>Room ID</label>
                <input
                  value={timetableForm.room_id}
                  onChange={(e) => setTimetableForm({ ...timetableForm, room_id: e.target.value })}
                />
              </div>
              <div>
                <label>Lesson number</label>
                <input
                  value={timetableForm.lesson_number}
                  onChange={(e) => setTimetableForm({ ...timetableForm, lesson_number: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label>Title</label>
                <input
                  value={timetableForm.title}
                  onChange={(e) => setTimetableForm({ ...timetableForm, title: e.target.value })}
                />
              </div>
              <button type="submit">Upsert</button>
            </form>
            <form onSubmit={deleteTimetable} style={{ marginTop: 12 }}>
              <label>Delete timetable by ID</label>
              <input value={timetableDeleteId} onChange={(e) => setTimetableDeleteId(e.target.value)} />
              <button type="submit" style={{ marginTop: 8 }}>
                Delete
              </button>
            </form>
          </div>
        )}

        {activeTab === "media" && (
          <div className="card">
            <h2 className="section-title">Media</h2>
            <form onSubmit={uploadMedia}>
              <input type="file" name="media_file" accept="video/*" />
              <button type="submit" style={{ marginTop: 8 }}>
                Upload
              </button>
            </form>
            <ul>
              {media.map((item) => (
                <li key={item.id}>
                  {item.filename} —{" "}
                  <a href={resolveUrl(item.url)} target="_blank" rel="noreferrer">
                    open
                  </a>{" "}
                  <button className="secondary" onClick={() => deleteMedia(item.id)}>
                    delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="card">
            <h2 className="section-title">Analytics</h2>
            <form onSubmit={runAnalytics} className="grid grid-2">
              <div>
                <label>Date (YYYY-MM-DD)</label>
                <input
                  value={analyticsFilters.date}
                  onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, date: e.target.value })}
                />
              </div>
              <div>
                <label>Class ID</label>
                <input
                  value={analyticsFilters.class_id}
                  onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, class_id: e.target.value })}
                />
              </div>
              <div>
                <label>Student ID</label>
                <input
                  value={analyticsFilters.student_id}
                  onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, student_id: e.target.value })}
                />
              </div>
              <div>
                <label>Status</label>
                <select
                  value={analyticsFilters.status}
                  onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, status: e.target.value })}
                >
                  <option value="">any</option>
                  <option value="on_time">on_time</option>
                  <option value="late">late</option>
                </select>
              </div>
              <button type="submit">Run</button>
            </form>
            <ul>
              {checkins.map((item) => (
                <li key={item.id}>
                  {item.arrival_at} — {item.student?.full_name || "Unknown"} — {item.status}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
