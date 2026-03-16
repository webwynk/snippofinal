import { readData, updateData, nextCounter, getPagedBookings } from "../store.js";
import { formatDateForUi, normalizeTimeLabel, toDollarAmount } from "../utils.js";
import { asyncHandler, httpError } from "../utils/errorHelpers.js";
import { resolveStaffForUser } from "../utils/userHelpers.js";
import { sendEmail, sendTemplatedEmail } from "../utils/mailer.js";

export const getBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "10");
  
  const data = await readData();
  const user = data.users.find((item) => item.id === req.authUser.id);

  if (!user) {
    throw httpError(401, "Session invalid");
  }

  if (user.role === "admin") {
    const paged = await getPagedBookings({ page, limit });
    res.json(paged);
    return;
  }

  if (user.role === "user") {
    const paged = await getPagedBookings({ userId: user.id, page, limit });
    res.json(paged);
    return;
  }

  const staffRef = resolveStaffForUser(data, user);
  if (!staffRef) {
    res.json({ data: [], total: 0, pages: 0, currentPage: page });
    return;
  }
  
  const paged = await getPagedBookings({ staffName: staffRef.name, page, limit });
  res.json(paged);
});

export const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, staffId, date, time, details } = req.body || {};

  let createdBooking;
  await updateData(async (data) => {
    const user = data.users.find((item) => item.id === req.authUser.id);
    if (!user) {
      throw httpError(401, "Session invalid");
    }

    const service = data.services.find((item) => item.id === Number(serviceId) && item.active);
    if (!service) {
      throw httpError(400, "Selected service is unavailable");
    }

    const staffMember = data.staff.find((item) => item.id === Number(staffId) && item.active);
    if (!staffMember) {
      throw httpError(400, "Selected staff member is unavailable");
    }

    if (!staffMember.services.includes(Number(service.id))) {
      throw httpError(400, "Selected staff member is not assigned to this service");
    }

    const dateLabel = formatDateForUi(date);
    const timeLabel = normalizeTimeLabel(time);
    if (!dateLabel || !timeLabel) {
      throw httpError(400, "Invalid date or time");
    }

    const hasConflict = data.bookings.some(
      (booking) =>
        booking.stf === staffMember.name &&
        booking.dt === dateLabel &&
        booking.t === timeLabel &&
        ["upcoming", "active"].includes(booking.s)
    );

    if (hasConflict) {
      throw httpError(409, "Selected slot is already booked");
    }

    const bookingId = `BK-${await nextCounter("booking")}`;
    const customerName = String(details?.name || user.name || "").trim() || user.name;

    createdBooking = {
      id: bookingId,
      userId: user.id,
      svc: service.name,
      stf: staffMember.name,
      dt: dateLabel,
      t: timeLabel,
      p: toDollarAmount(service.price),
      s: "upcoming",
      paid: true,
      u: customerName,
      serviceId: service.id,
      staffId: staffMember.id,
      notes: String(details?.notes || "").trim(),
      createdAt: new Date().toISOString(),
      originalDuration: String(service.dur || "60"),
    };

    data.bookings.push(createdBooking);
    return createdBooking;
  });

  res.status(201).json(createdBooking);

  // 1. To User
  sendTemplatedEmail("user_booking_confirmation", req.authUser.email, {
    name: createdBooking.u,
    bookingId: createdBooking.id,
    service: createdBooking.svc,
    staff: createdBooking.stf,
    date: createdBooking.dt,
    time: createdBooking.t
  }).catch(err => console.error('Failed to send user confirmation email', err));

  // 2. To Staff (Find staff email in data)
  readData().then(data => {
    const staffMember = data.staff.find(s => s.id === createdBooking.staffId);
    if (staffMember && staffMember.email) {
      sendTemplatedEmail("staff_booking_notification", staffMember.email, {
        staff: staffMember.name,
        bookingId: createdBooking.id,
        name: createdBooking.u,
        service: createdBooking.svc,
        date: createdBooking.dt,
        time: createdBooking.t
      }).catch(err => console.error('Failed to notify staff', err));
    }
  });

  // 3. To Admin
  sendTemplatedEmail("admin_booking_alert", process.env.SMTP_FROM_EMAIL, {
    bookingId: createdBooking.id,
    name: createdBooking.u,
    email: req.authUser.email,
    staff: createdBooking.stf,
    service: createdBooking.svc,
    date: createdBooking.dt,
    time: createdBooking.t
  }).catch(err => console.error('Failed to notify admin', err));
});

export const extendBooking = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const extraHours = Number(req.body?.additionalHours || 0);

  if (![1, 2, 3, 4].includes(extraHours)) {
    throw httpError(400, "Additional hours must be 1, 2, 3, or 4");
  }

  let updated;
  await updateData(async (data) => {
    const booking = data.bookings.find((b) => b.id === id);
    if (!booking) throw httpError(404, "Booking not found");
    if (booking.userId !== req.authUser.id) throw httpError(403, "Forbidden");

    const today = formatDateForUi(new Date());
    if (booking.dt !== today) {
      throw httpError(400, "Extensions are only allowed on the appointment date.");
    }

    const currentExtra = booking.additionalHours || 0;
    if (currentExtra + extraHours > 4) {
      throw httpError(400, `Max 4 hours total. You have ${4 - currentExtra}h remaining.`);
    }

    const service = data.services.find((s) => s.id === booking.serviceId);
    const originalDur = parseInt(booking.originalDuration || service?.dur || "60");

    const newAdditionalHours = currentExtra + extraHours;
    const newAdditionalCost = newAdditionalHours * 60; // $60 per hour

    booking.additionalHours = newAdditionalHours;
    booking.additionalCost = newAdditionalCost;
    booking.originalDuration = booking.originalDuration || String(originalDur);
    booking.dur = String(originalDur + newAdditionalHours * 60);

    console.log(`[notification] Booking ${id} extended by ${extraHours}h. Staff: ${booking.stf}`);
    updated = { ...booking };
  });

  res.json(updated);

  // 1. To User
  sendTemplatedEmail("booking_extension_user", req.authUser.email, {
    name: updated.u,
    bookingId: updated.id,
    extraHours: extraHours,
    dur: updated.dur
  }).catch(err => console.error('Failed to send user extension email', err));

  // 2. To Staff
  readData().then(data => {
    const staffMember = data.staff.find(s => s.id === updated.staffId);
    if (staffMember && staffMember.email) {
      sendTemplatedEmail("booking_extension_staff", staffMember.email, {
        staff: staffMember.name,
        bookingId: updated.id,
        name: updated.u,
        extraHours: extraHours,
        dur: updated.dur
      }).catch(err => console.error('Failed to notify staff of extension', err));
    }
  });

  // 3. To Admin
  sendTemplatedEmail("booking_extension_admin", process.env.SMTP_FROM_EMAIL, {
    bookingId: updated.id,
    name: updated.u,
    staff: updated.stf,
    extraHours: extraHours,
    dur: updated.dur
  }).catch(err => console.error('Failed to notify admin of extension', err));
});
