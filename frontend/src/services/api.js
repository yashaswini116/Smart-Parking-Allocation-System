const BASE = '/api';

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
};

// Users
export const loginUser = (data) =>
  fetch(`${BASE}/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);

export const registerUser = (data) =>
  fetch(`${BASE}/users/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);

// Parking Lots
export const getAllLots = () => fetch(`${BASE}/lots`).then(handleResponse);
export const getLotById = (id) => fetch(`${BASE}/lots/${id}`).then(handleResponse);
export const getNearbyLots = (lat, lng, radius = 10) =>
  fetch(`${BASE}/lots/nearby?lat=${lat}&lng=${lng}&radius=${radius}`).then(handleResponse);
export const getLotAvailability = (id) => fetch(`${BASE}/lots/${id}/availability`).then(handleResponse);
export const getSlotsByLot = (id) => fetch(`${BASE}/lots/${id}/slots`).then(handleResponse);
export const createLot = (data) =>
  fetch(`${BASE}/lots`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const updateLot = (id, data) =>
  fetch(`${BASE}/lots/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const deleteLot = (id) =>
  fetch(`${BASE}/lots/${id}`, { method: 'DELETE' }).then(handleResponse);
export const updateSlotStatus = (slotId, status) =>
  fetch(`${BASE}/lots/slots/${slotId}/status?status=${status}`, { method: 'PUT' }).then(handleResponse);

// Bookings
export const createBooking = (data) =>
  fetch(`${BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const getUserBookings = (userId) => fetch(`${BASE}/bookings/user/${userId}`).then(handleResponse);
export const getBookingById = (id) => fetch(`${BASE}/bookings/${id}`).then(handleResponse);
export const recordEntry = (bookingId) =>
  fetch(`${BASE}/bookings/${bookingId}/entry`, { method: 'PUT' }).then(handleResponse);
export const recordExit = (bookingId) =>
  fetch(`${BASE}/bookings/${bookingId}/exit`, { method: 'PUT' }).then(handleResponse);
export const cancelBooking = (bookingId) =>
  fetch(`${BASE}/bookings/${bookingId}`, { method: 'DELETE' }).then(handleResponse);
export const getWaitingQueue = (lotId, vehicleType) =>
  fetch(`${BASE}/bookings/waiting/${lotId}/${vehicleType}`).then(handleResponse);

// Payments
export const processPayment = (data) =>
  fetch(`${BASE}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const getPaymentByBooking = (bookingId) => fetch(`${BASE}/payments/booking/${bookingId}`).then(handleResponse);

// Admin
export const getAdminMonitor = () => fetch(`${BASE}/admin/monitor`).then(handleResponse);
