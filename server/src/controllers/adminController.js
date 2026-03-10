import { readData, updateData, nextCounter } from "../store.js";
import { normalizeEmail, initials, pickColor } from "../utils.js";
import { asyncHandler, httpError } from "../utils/errorHelpers.js";
import { userByEmail } from "../utils/userHelpers.js";

export const getAdminData = asyncHandler(async (_req, res) => {
  const data = await readData();
  res.json({
    services: data.services,
    staff: data.staff,
    bookings: data.bookings,
    pendingStaff: data.pendingStaff,
  });
});

export const createService = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const desc = String(req.body?.desc || "").trim();
  const price = Number(req.body?.price || 0);
  const dur = String(req.body?.dur || "60");
  const img = String(req.body?.img || "").trim();
  const active = Boolean(req.body?.active ?? true);

  if (!name) throw httpError(400, "Service name is required");
  if (!Number.isFinite(price) || price <= 0) throw httpError(400, "Service price must be greater than zero");

  let createdService;
  await updateData(async (data) => {
    createdService = {
      id: await nextCounter("service"),
      name,
      desc,
      price,
      dur,
      img,
      active,
    };
    data.services.push(createdService);
    return createdService;
  });

  res.status(201).json(createdService);
});

export const updateService = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const name = String(req.body?.name || "").trim();
  const desc = String(req.body?.desc || "").trim();
  const price = Number(req.body?.price || 0);
  const dur = String(req.body?.dur || "60");
  const img = String(req.body?.img || "").trim();
  const active = Boolean(req.body?.active ?? true);

  if (!name) throw httpError(400, "Service name is required");
  if (!Number.isFinite(price) || price <= 0) throw httpError(400, "Service price must be greater than zero");

  let updatedService;
  await updateData(async (data) => {
    const service = data.services.find((item) => item.id === id);
    if (!service) throw httpError(404, "Service not found");

    service.name = name;
    service.desc = desc;
    service.price = price;
    service.dur = dur;
    service.img = img;
    service.active = active;
    updatedService = service;
    return updatedService;
  });

  res.json(updatedService);
});

export const deleteService = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await updateData(async (data) => {
    const exists = data.services.some((item) => item.id === id);
    if (!exists) throw httpError(404, "Service not found");

    data.services = data.services.filter((item) => item.id !== id);
    data.staff = data.staff.map((member) => ({
      ...member,
      services: (member.services || []).filter((serviceId) => serviceId !== id),
    }));
    return true;
  });

  res.status(204).end();
});

export const createStaff = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const role = String(req.body?.role || "").trim();
  const email = normalizeEmail(req.body?.email);
  const color = String(req.body?.c || pickColor());
  const services = Array.isArray(req.body?.services)
    ? req.body.services.map(Number).filter(Number.isFinite)
    : [];
  const avail = Array.isArray(req.body?.avail) && req.body.avail.length === 7
    ? req.body.avail.map(Boolean)
    : [true, true, true, true, true, false, false];

  if (!name) throw httpError(400, "Name is required");
  if (!role) throw httpError(400, "Role is required");
  if (!email.includes("@")) throw httpError(400, "A valid email is required");

  let createdStaff;
  await updateData(async (data) => {
    const duplicate = data.staff.find(
      (member) => normalizeEmail(member.email) === normalizeEmail(email)
    );
    if (duplicate) throw httpError(409, "A staff member with this email already exists");

    createdStaff = {
      id: await nextCounter("staff"),
      name,
      role,
      email,
      i: initials(name),
      c: color,
      services,
      avail,
      active: true,
    };
    data.staff.push(createdStaff);

    const linkedUser = userByEmail(data, email);
    if (linkedUser && linkedUser.role === "staff") {
      linkedUser.status = "active";
      linkedUser.staffId = createdStaff.id;
      linkedUser.name = createdStaff.name;
      linkedUser.roleTitle = createdStaff.role;
    }

    return createdStaff;
  });

  res.status(201).json(createdStaff);
});

export const updateStaff = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const name = String(req.body?.name || "").trim();
  const role = String(req.body?.role || "").trim();
  const email = normalizeEmail(req.body?.email);
  const color = String(req.body?.c || pickColor());
  const services = Array.isArray(req.body?.services)
    ? req.body.services.map(Number).filter(Number.isFinite)
    : [];
  const avail = Array.isArray(req.body?.avail) && req.body.avail.length === 7
    ? req.body.avail.map(Boolean)
    : [true, true, true, true, true, false, false];
  const active = Boolean(req.body?.active ?? true);

  if (!name) throw httpError(400, "Name is required");
  if (!role) throw httpError(400, "Role is required");
  if (!email.includes("@")) throw httpError(400, "A valid email is required");

  let updatedStaff;
  await updateData(async (data) => {
    const staffMember = data.staff.find((item) => item.id === id);
    if (!staffMember) throw httpError(404, "Staff member not found");

    const duplicateStaff = data.staff.find(
      (item) => item.id !== id && normalizeEmail(item.email) === email
    );
    if (duplicateStaff) throw httpError(409, "Another staff member already uses this email");

    const duplicateUser = data.users.find(
      (item) => item.id !== req.authUser.id && normalizeEmail(item.email) === email
    );
    if (duplicateUser && duplicateUser.role !== "staff") {
      throw httpError(409, "Email already belongs to another account");
    }

    const oldName = staffMember.name;
    const oldEmail = staffMember.email;

    staffMember.name = name;
    staffMember.role = role;
    staffMember.email = email;
    staffMember.c = color;
    staffMember.i = initials(name);
    staffMember.services = services;
    staffMember.avail = avail;
    staffMember.active = active;
    updatedStaff = staffMember;

    if (oldName !== name) {
      data.bookings.forEach((booking) => {
        if (booking.stf === oldName) {
          booking.stf = name;
        }
      });
    }

    const linkedUser = data.users.find(
      (item) =>
        item.role === "staff" &&
        (item.staffId === id || normalizeEmail(item.email) === normalizeEmail(oldEmail))
    );
    if (linkedUser) {
      linkedUser.name = name;
      linkedUser.email = email;
      linkedUser.roleTitle = role;
      linkedUser.status = active ? "active" : "disabled";
      linkedUser.staffId = active ? id : null;
    }

    return updatedStaff;
  });

  res.json(updatedStaff);
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await updateData(async (data) => {
    const staffMember = data.staff.find((item) => item.id === id);
    if (!staffMember) throw httpError(404, "Staff member not found");

    data.staff = data.staff.filter((item) => item.id !== id);
    data.users = data.users.map((user) => {
      if (user.role === "staff" && user.staffId === id) {
        return { ...user, status: "disabled", staffId: null };
      }
      return user;
    });
    return true;
  });

  res.status(204).end();
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const status = String(req.body?.status || "");
  const allowed = ["upcoming", "active", "completed", "cancelled"];

  if (!allowed.includes(status)) throw httpError(400, "Invalid booking status");

  let updated;
  await updateData(async (data) => {
    const booking = data.bookings.find((item) => item.id === id);
    if (!booking) throw httpError(404, "Booking not found");
    booking.s = status;
    updated = booking;
    return updated;
  });

  res.json(updated);
});

export const approvePendingStaff = asyncHandler(async (req, res) => {
  const id = String(req.params.id);

  let approvedMember;
  let pendingStaff;
  await updateData(async (data) => {
    const pending = data.pendingStaff.find((item) => item.id === id);
    if (!pending) throw httpError(404, "Pending request not found");

    approvedMember = {
      id: await nextCounter("staff"),
      name: pending.name,
      role: pending.role || "Specialist",
      email: pending.email,
      i: pending.i || initials(pending.name),
      c: pending.c || pickColor(),
      services: pending.requestedServices || [],
      avail: [true, true, true, true, true, false, false],
      active: true,
    };

    data.staff.push(approvedMember);
    data.pendingStaff = data.pendingStaff.filter((item) => item.id !== id);
    pendingStaff = data.pendingStaff;

    const user = data.users.find(
      (item) =>
        item.role === "staff" &&
        (item.id === pending.userId || normalizeEmail(item.email) === normalizeEmail(pending.email))
    );
    if (user) {
      user.name = approvedMember.name;
      user.email = approvedMember.email;
      user.roleTitle = approvedMember.role;
      user.status = "active";
      user.staffId = approvedMember.id;
      user.pendingId = null;
    }

    return approvedMember;
  });

  res.json({ staffMember: approvedMember, pendingStaff });
});

export const rejectPendingStaff = asyncHandler(async (req, res) => {
  const id = String(req.params.id);

  let pendingStaff;
  await updateData(async (data) => {
    const pending = data.pendingStaff.find((item) => item.id === id);
    if (!pending) throw httpError(404, "Pending request not found");

    data.pendingStaff = data.pendingStaff.filter((item) => item.id !== id);
    pendingStaff = data.pendingStaff;

    const user = data.users.find(
      (item) =>
        item.role === "staff" &&
        (item.id === pending.userId || normalizeEmail(item.email) === normalizeEmail(pending.email))
    );
    if (user) {
      user.status = "rejected";
      user.pendingId = null;
    }

    return true;
  });

  res.json({ pendingStaff });
});
