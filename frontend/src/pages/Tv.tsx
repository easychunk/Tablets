import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch, getToken, resolveUrl } from "../api";

type Lesson = {
  lesson_number: number;
  title: string;
  start_time: string;
  end_time: string;
  room_name: string;
};

type ScheduleResponse = {
  class_id: number;
  date: string;
  lessons: Lesson[];
};

type MediaItem = {
  id: number;
  url: string;
  is_active: boolean;
};

type Slide =
  | { type: "schedule"; classId: number; data: ScheduleResponse }
  | { type: "video"; url: string };

export default function TvPage() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const classIds = useMemo(() => {
    const raw = params.get("classes");
    if (!raw) return [1, 2];
    return raw.split(",").map((id) => Number(id.trim())).filter((id) => !Number.isNaN(id));
  }, [params]);

  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      const date = new Date().toISOString().slice(0, 10);
      const schedules = await Promise.all(
        classIds.map((classId) =>
          apiFetch<ScheduleResponse>(`/api/classes/${classId}/schedule?date=${date}`)
        )
      );

      const list: Slide[] = schedules.map((data) => ({
        type: "schedule",
        classId: data.class_id,
        data,
      }));

      const queryVideo = params.get("video");
      if (queryVideo) {
        list.push({ type: "video", url: resolveUrl(queryVideo) });
      } else if (getToken()) {
        try {
          const media = await apiFetch<MediaItem[]>("/api/admin/media", {}, true);
          const active = media.find((item) => item.is_active);
          if (active) {
            list.push({ type: "video", url: resolveUrl(active.url) });
          }
        } catch {
          // ignore
        }
      }

      setSlides(list);
      setIndex(0);
    };

    load();
  }, [classIds, params]);

  useEffect(() => {
    if (slides.length === 0) return;
    const current = slides[index];
    const duration = current.type === "video" ? 30000 : 20000;
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [index, slides]);

  const current = slides[index];

  if (!current) {
    return (
      <div className="kiosk">
        <h1>TV</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (current.type === "video") {
    return (
      <div className="kiosk">
        <h1>Video</h1>
        <video src={current.url} autoPlay loop muted style={{ maxWidth: "80%" }} />
        <p>URL: {current.url}</p>
      </div>
    );
  }

  return (
    <div className="kiosk">
      <h1>Class {current.classId}</h1>
      <div className="card" style={{ width: "80%" }}>
        {current.data.lessons.map((lesson) => (
          <div key={lesson.lesson_number} style={{ marginBottom: 12 }}>
            <div>
              <strong>
                {lesson.lesson_number}. {lesson.title}
              </strong>
            </div>
            <div>
              {lesson.start_time} - {lesson.end_time} · {lesson.room_name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
