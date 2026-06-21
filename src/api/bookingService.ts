// src/api/bookingService.ts

const API_URL = 'http://127.0.0.1:8000/api/bookings';

export const createBooking = async (bookingData: any) => {
  const token = localStorage.getItem('token_akses');
  const response = await fetch(`${API_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  });
  return response.json();
};

export const uploadPaymentProof = async (bookingId: string, file: File) => {
  const token = localStorage.getItem('token_akses');
  const formData = new FormData();
  formData.append('payment_proof', file);

  const response = await fetch(`${API_URL}/${bookingId}/upload-payment/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return response.json();
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  const token = localStorage.getItem('token_akses');
  const response = await fetch(`${API_URL}/admin/${bookingId}/status/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  return response.json();
};