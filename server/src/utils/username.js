import User from "../models/User.js";

export const normalizeUsername = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);

export const ensureUniqueUsername = async (baseValue) => {
  const base = normalizeUsername(baseValue) || `user${Date.now().toString().slice(-5)}`;

  let candidate = base;
  let suffix = 0;

  while (await User.exists({ username: candidate })) {
    suffix += 1;
    const trimmed = base.slice(0, Math.max(3, 24 - String(suffix).length));
    candidate = `${trimmed}${suffix}`;
  }

  return candidate;
};
