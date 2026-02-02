import { FormEvent, useState } from "react";
import { apiFetch } from "../api";

type CheckinResponse = {
  ok: boolean;
  status: string;
  arrival_time: string;
  late_by_minutes: number;
  student: { id: number; full_name: string; class_id: number } | null;
};

export default function EntrancePage() {
  const [nfcUid, setNfcUid] = useState("");
  const [deviceKey, setDeviceKey] = useState("entrance-01");
  const [result, setResult] = useState<CheckinResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await apiFetch<CheckinResponse>("/api/checkins", {
        method: "POST",
        body: JSON.stringify({ nfc_uid: nfcUid, device_key: deviceKey }),
      });
      setResult(response);
      setError(null);
      setNfcUid("");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="kiosk">
      <h1>Entrance</h1>
      <p>Tap your NFC to check-in</p>
      <form onSubmit={submit} style={{ maxWidth: 360, width: "100%" }}>
        <label>NFC UID</label>
        <input value={nfcUid} onChange={(e) => setNfcUid(e.target.value)} required />
        <label>Device key</label>
        <input value={deviceKey} onChange={(e) => setDeviceKey(e.target.value)} required />
        <div style={{ marginTop: 12 }}>
          <button type="submit">Check in</button>
        </div>
      </form>
      {error && <p>{error}</p>}
      {result && (
        <div className="status">
          {result.student ? result.student.full_name : "Unknown student"} —{" "}
          {result.status === "late" ? `Late by ${result.late_by_minutes} min` : "On time"}
        </div>
      )}
    </div>
  );
}
