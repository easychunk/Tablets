# School Display Ecosystem — SPEC

## 1. Goal
Build a school-wide display system:
- Door tablets near each classroom show current time + current/next lesson info.
- Entrance tablet logs student arrivals using NFC and marks lateness.
- TV screen page rotates between schedules for different classes and an advertising video.
- Admin panel manages schedules, content, and analytics (attendance + lateness).

## 2. Roles
### 2.1 Admin
- Can manage rooms, classes, schedules, bell times, users, and devices.
- Can upload/manage TV video content.
- Can view analytics: attendance, lateness, trends per student/class/date.

### 2.2 Student (via NFC)
- Uses NFC tag/card to check-in at school entrance.
- System records arrival time and whether it is late.

### 2.3 Teacher (optional for future)
- Could view schedule or confirm attendance (future scope).

## 3. Devices / Screens
### 3.1 Door Tablet (per classroom)
Shows:
- Current time
- Current lesson name (or subject)
- Start and end time of current lesson
- Next lesson preview (optional MVP+)
- Room identifier (e.g., "A-101")

Behavior:
- Runs in kiosk mode
- Auto-refreshes (polling every 5–10 seconds)
- Should work read-only (no interaction required)

### 3.2 Entrance Tablet (check-in)
Shows:
- Current time
- "Tap your NFC to check-in"
- After scan: confirmation + status (on time / late)

Behavior:
- Reads NFC UID
- Sends check-in event to backend
- Kiosk mode, always-on

### 3.3 TV Page (large screen)
Shows:
- Rotating schedule views for multiple classes (e.g., 10A, 10B, 9A...)
- Periodically plays an advertising/promotional video
- Fully automated loop

Behavior:
- Web page in fullscreen
- Timeline-based rotation (e.g., schedule 20s -> next class 20s -> video 30s -> repeat)

## 4. Core Data Concepts
- Rooms (classrooms)
- Classes (e.g., 10A)
- Students (linked to NFC UID)
- Bell schedule (lesson times per day)
- Timetable (which class is in which room with which subject per timeslot)
- Check-ins (arrival events)
- Lateness rules (based on first lesson start time / configurable grace period)
- Media (TV videos) + playlists (optional)

## 5. MVP Scope
### 5.1 Required (MVP)
1) Door display page:
   - Current time
   - Current lesson title + start/end
   - Room name
2) Entrance check-in:
   - NFC UID check-in endpoint
   - Save arrival timestamp
   - Determine late/on-time (rule-based)
3) TV page:
   - Rotate between schedules for selected classes
   - Play a selected video periodically
4) Admin panel:
   - CRUD: rooms, classes, students (NFC UID)
   - Edit timetable (basic)
   - Upload/manage TV videos (basic)
   - Analytics: list of arrivals, late arrivals per day + filters

### 5.2 Out of Scope (future)
- Teacher login + attendance per lesson
- Push notifications
- Integration with external school systems
- Offline-first replication
- Advanced permissions and audit logs

## 6. Lateness Logic (MVP)
- Define school day start time (e.g., first lesson starts at HH:MM).
- Define grace period in minutes (e.g., 0–5 minutes).
- A check-in is "late" if arrival_time > start_time + grace_period.

Later extension:
- late per specific class schedule or per student exceptions.

## 7. Tech Stack (proposal)
- DB: MySQL 8 (InnoDB, utf8mb4)
- Backend API: FastAPI (Python)
- Frontend:
  - Door/Entrance/TV pages: React + Vite (kiosk web)
  - Admin panel: React + Vite (same repo or separate app)
- Local dev: Docker Compose

## 8. API (MVP)
### 8.1 Public display endpoints
- GET /api/rooms/{room_id}/now
  Returns current lesson info for door tablet.
- GET /api/classes/{class_id}/schedule?date=YYYY-MM-DD
  Returns schedule for TV rotation.

### 8.2 NFC check-in
- POST /api/checkins
  Body: { "nfc_uid": "string", "device_key": "string" }
  Returns: { ok, student, status: "on_time"|"late", arrival_time, late_by_minutes }

### 8.3 Admin endpoints (secured)
- CRUD rooms/classes/students
- PUT timetable entries
- Media upload/list/delete
- Analytics endpoints

## 9. Database (MVP tables)
Suggested tables:
- rooms(id, name, location, is_active)
- classes(id, name, is_active)
- students(id, full_name, class_id, nfc_uid unique, is_active)
- bell_times(id, weekday, lesson_number, start_time, end_time)
- timetable(id, date OR weekday, class_id, room_id, lesson_number, title/subject)
- devices(id, device_key unique, type enum('door','entrance','tv'), room_id nullable, last_seen_at)
- checkins(id, student_id nullable, nfc_uid, device_id, arrival_at, status enum('on_time','late'), late_by_minutes)

Media:
- media(id, type enum('video'), filename, url/path, duration_sec, is_active)
- tv_playlist(id, media_id, order_index, is_active) (optional for MVP)

## 10. Non-Functional Requirements
- Kiosk-friendly UI, large readable fonts
- Works in Europe/Vienna timezone
- No hardcoded secrets; use env vars
- Admin auth required (JWT or session)

## 11. Acceptance Criteria (MVP)
- `docker compose up` starts DB + backend + frontend apps
- Door page for a room shows correct current lesson based on bell_times + timetable
- Entrance page accepts NFC scan (mock/manual input ok at first) and records check-in
- Admin can add a student with NFC UID and see check-ins + lateness
- TV page rotates schedules and plays a video in loop
