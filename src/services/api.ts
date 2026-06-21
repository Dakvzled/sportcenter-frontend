// Django REST Framework backend integration
// Base URL points to Django dev server; set VITE_API_URL in .env for production
const BASE_URL = (import.meta as Record<string, unknown> & { env?: Record<string, string> }).env?.VITE_API_URL ?? 'http://localhost:8000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; phone: string; password: string; password_confirm: string }
export interface AuthResponse { access: string; refresh: string; user: User }

export const auth = {
  login: (data: LoginPayload) =>
    request<AuthResponse>('/auth/login/', 'POST', data),
  register: (data: RegisterPayload) =>
    request<AuthResponse>('/auth/register/', 'POST', data),
  refresh: (refresh: string) =>
    request<{ access: string }>('/auth/token/refresh/', 'POST', { refresh }),
};

// ─── Types ───────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'superadmin';
}

export interface Court {
  id: number;
  name: string;
  sport_type: 'badminton' | 'voli' | 'futsal' | 'mini-soccer' | 'basket';
  capacity: number;
  price_weekday: number;
  price_weekend: number;
  photo?: string;
  is_active: boolean;
}

export type SlotStatus = 'available' | 'booked' | 'blocked';

export interface TimeSlot {
  time: string;      // "HH:00"
  status: SlotStatus;
  price: number;
  booking_id?: number;
}

export type BookingStatus =
  | 'PENDING'
  | 'WAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'PAYMENT_REJECTED';

export interface Booking {
  id: number;
  booking_code: string;
  court: Court;
  date: string;      // "YYYY-MM-DD"
  time_start: string;
  time_end: string;
  duration: number;
  total_price: number;
  status: BookingStatus;
  payment_proof?: string;
  rejection_reason?: string;
  created_at: string;
  user: User;
}

export interface CreateBookingPayload {
  court_id: number;
  date: string;
  time_start: string;
  time_end: string;
  people_count: number;
  notes?: string;
}

export interface AdminStats {
  revenue_today: number;
  revenue_month: number;
  bookings_today: number;
  pending_verifications: number;
  occupancy_rate: number;
}

// ─── Courts ──────────────────────────────────────────────────────────────────
export const courts = {
  list: () =>
    request<Court[]>('/courts/'),
  getSlots: (courtId: number, date: string) =>
    request<TimeSlot[]>(`/courts/${courtId}/slots/?date=${date}`),
  create: (data: Partial<Court>, token: string) =>
    request<Court>('/courts/', 'POST', data, token),
  update: (id: number, data: Partial<Court>, token: string) =>
    request<Court>(`/courts/${id}/`, 'PATCH', data, token),
  toggleActive: (id: number, token: string) =>
    request<Court>(`/courts/${id}/toggle-active/`, 'POST', undefined, token),
  blockSlot: (id: number, date: string, time: string, token: string) =>
    request<void>(`/courts/${id}/block-slot/`, 'POST', { date, time }, token),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookings = {
  create: (data: CreateBookingPayload, token: string) =>
    request<Booking>('/bookings/', 'POST', data, token),
  myBookings: (token: string) =>
    request<Booking[]>('/bookings/my/', 'GET', undefined, token),
  cancel: (id: number, token: string) =>
    request<Booking>(`/bookings/${id}/cancel/`, 'POST', undefined, token),
  uploadPayment: (id: number, file: File, method: string, token: string) => {
    const form = new FormData();
    form.append('payment_proof', file);
    form.append('payment_method', method);
    return fetch(`${BASE_URL}/bookings/${id}/upload-payment/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then(r => r.json() as Promise<Booking>);
  },
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const admin = {
  stats: (token: string) =>
    request<AdminStats>('/admin/stats/', 'GET', undefined, token),
  pendingBookings: (token: string) =>
    request<Booking[]>('/admin/bookings/?status=WAITING_CONFIRMATION', 'GET', undefined, token),
  allBookings: (token: string) =>
    request<Booking[]>('/admin/bookings/', 'GET', undefined, token),
  confirmPayment: (id: number, token: string) =>
    request<Booking>(`/admin/bookings/${id}/confirm/`, 'POST', undefined, token),
  rejectPayment: (id: number, reason: string, token: string) =>
    request<Booking>(`/admin/bookings/${id}/reject/`, 'POST', { reason }, token),
  users: (token: string) =>
    request<User[]>('/admin/users/', 'GET', undefined, token),
  blockUser: (id: number, token: string) =>
    request<User>(`/admin/users/${id}/block/`, 'POST', undefined, token),
};

// ─── Mock fallback for demo when Django is offline ───────────────────────────
export function isMockMode(): boolean {
  return import.meta.env?.VITE_MOCK_MODE === 'true' || !import.meta.env?.VITE_API_URL;
}
