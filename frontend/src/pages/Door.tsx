import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api";

type DoorLesson = {
  title: string;
  start_time: string;
  end_time: string;
};

type DoorResponse = {
  room_id: number;
  room_name: string;
  current_time: string;
  lesson: DoorLesson | null;
};

export default function DoorPage() {
  const { roomId } = useParams();
  const [data, setData] = useState<DoorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const numericRoomId = useMemo(() => Number(roomId), [roomId]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await apiFetch<DoorResponse>(`/api/rooms/${numericRoomId}/now`);
        if (mounted) {
          setData(response);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError((err as Error).message);
        }
      }
    };

    load();
    const timer = setInterval(load, 7000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [numericRoomId]);

  if (Number.isNaN(numericRoomId)) {
    return <div className="kiosk">Invalid roomId</div>;
  }

  return (
    <div className="kiosk">
      <h1>{data?.room_name || "Room"}</h1>
      <h2>{data?.current_time ? new Date(data.current_time).toLocaleTimeString() : "--:--"}</h2>
      {error && <p>{error}</p>}
      {data?.lesson ? (
        <>
          <div className="status">{data.lesson.title}</div>
          <p>
            {data.lesson.start_time} - {data.lesson.end_time}
          </p>
        </>
      ) : (
        <p>No current lesson</p>
      )}
    </div>
  );
}
