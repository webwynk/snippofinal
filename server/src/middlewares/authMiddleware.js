import { getBearerToken, verifyToken } from "../auth.js";
import { readData } from "../store.js";
import { asyncHandler, httpError } from "../utils/errorHelpers.js";

async function resolveTokenUser(req) {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    const data = await readData();
    const user = data.users.find((item) => item.id === payload.id);
    return user || null;
  } catch {
    return null;
  }
}

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.authUser = await resolveTokenUser(req);
  next();
});

export function requireAuth(roles = []) {
  return asyncHandler(async (req, _res, next) => {
    const user = await resolveTokenUser(req);
    if (!user) {
      throw httpError(401, "Authentication required");
    }
    if (roles.length > 0 && !roles.includes(user.role)) {
      throw httpError(403, "Forbidden");
    }
    req.authUser = user;
    next();
  });
}
