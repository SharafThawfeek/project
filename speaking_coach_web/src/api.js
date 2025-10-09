const API_BASE = "http://localhost:8000"; // FastAPI backend

export async function signup(username, email, password) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function analyzeSpeech(transcript) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transcript }),
  });
  return res.json();
}

export async function getHistory() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getAnalytics() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getProgress() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
