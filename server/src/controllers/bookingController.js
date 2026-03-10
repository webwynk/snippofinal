import { readData, updateData, nextCounter } from "../store.js";
import { formatDateForUi, normalizeTimeLabel, toDollarAmount } from "../utils.js";
import { asyncHandler, httpError } from "../utils/errorHelpers.js";
import { resolveStaffForUser } from "../utils/userHelpers.js";

export const getBookings = asyncHandler(async (req, res) => {
  const data = await readData();
  const user = data.users.find((item) => item.id === req.authUser.id);

  if (!user) {
    throw httpError(401, "Session invalid");
  }

  if (user.role === "admin") {
    res.json(data.bookings);
    return;
  }

  if (user.role === "user") {
    res.json(data.bookings.filter((booking) => booking.userId === user.id));
    return;
  }

  const staffRef = resolveStaffForUser(data, user);
  if (!staffRef) {
    res.json([]);
    return;
  }
  res.json(data.bookings.filter((booking) => booking.stf === staffRef.name));
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
    };

    data.bookings.push(createdBooking);
    return createdBooking;
  });

  res.status(201).json(createdBooking);
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

    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (booking.dt !== today) throw httpError(400, "Can only extend bookings for today");

    const currentExtra = booking.additionalHours || 0;
    if (currentExtra + extraHours > 4) {
      throw httpError(400, `Max 4 hours total. You have ${4 - currentExtra}h remaining.`);
    }

    const service = data.services.find((s) => s.id === booking.serviceId);
    const originalDur = parseInt(booking.originalDuration || service?.dur || "60");

    const newAdditionalHours = currentExtra + extraHours;
    const newAdditionalCost = newAdditionalHours * 60;

    booking.additionalHours = newAdditionalHours;
    booking.additionalCost = newAdditionalCost;
    booking.originalDuration = booking.originalDuration || String(originalDur);
    booking.dur = String(originalDur + newAdditionalHours * 60);

    updated = { ...booking };
  });

  res.json(updated);
});
