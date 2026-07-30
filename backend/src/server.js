const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { initDatabase, mapQuitProfile, mapUser, query } = require("./db");
const { calculateProgress } = require("./progress");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function verifyPassword(password, user) {
  const candidate = hashPassword(password, user.passwordSalt).hash;
  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(user.passwordHash, "hex"));
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");
  await query("INSERT INTO sessions (token_hash, user_id) VALUES ($1, $2)", [tokenHash(token), user.id]);
  return token;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Please sign in again." });
    }

    const result = await query(
      `SELECT users.*
       FROM sessions
       INNER JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = $1`,
      [tokenHash(token)]
    );
    const user = mapUser(result.rows[0]);

    if (!user) {
      return res.status(401).json({ message: "Please sign in again." });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function deriveQuitProfile(input, userId, existingProfile) {
  const costPerVape = positiveNumber(input.costPerVape);
  const vapesPerWeek = positiveNumber(input.vapesPerWeek);
  const daysPerVape = positiveNumber(input.daysPerVape);

  if (!input.quitReason || !input.vapingHistory || !input.quitGoal || !costPerVape || !vapesPerWeek || !daysPerVape) {
    return null;
  }

  const now = new Date().toISOString();
  const estimatedDailyVapeUsage = Number((vapesPerWeek / 7).toFixed(2));
  const estimatedDailySpend = Number((costPerVape / daysPerVape).toFixed(2));

  return {
    id: existingProfile?.id || crypto.randomUUID(),
    userId,
    quitReason: input.quitReason,
    vapesPerWeek,
    vapingHistory: input.vapingHistory,
    costPerVape,
    daysPerVape,
    quitGoal: input.quitGoal,
    estimatedDailyVapeUsage,
    estimatedDailySpend,
    quitStartDate: existingProfile?.quitStartDate || now,
    setupCompletedAt: existingProfile?.setupCompletedAt || now,
    updatedAt: now,
  };
}

app.get("/", (req, res) => {
  res.json({
    service: "drop-the-vape-backend",
    status: "ok",
  });
});

app.get(
  "/health",
  asyncHandler(async (req, res) => {
    await query("SELECT 1");
    res.json({ status: "ok", database: "ok" });
  })
);

app.post(
  "/auth/signup",
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordRecord = hashPassword(password);
    const userResult = await query(
      `INSERT INTO users (id, name, email, password_hash, password_salt)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [crypto.randomUUID(), name, email, passwordRecord.hash, passwordRecord.salt]
    );
    const user = mapUser(userResult.rows[0]);
    const token = await createSession(user);

    return res.status(201).json({ token, user: publicUser(user) });
  })
);

app.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const userResult = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = mapUser(userResult.rows[0]);

    if (!user || !verifyPassword(password, user)) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    const token = await createSession(user);
    return res.json({ token, user: publicUser(user) });
  })
);

app.get("/auth/me", requireAuth, (req, res) => {
  return res.json({ user: publicUser(req.user) });
});

app.post(
  "/quit-profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const existingResult = await query("SELECT id FROM quit_profiles WHERE user_id = $1", [req.user.id]);

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ message: "Your quit profile is already set up." });
    }

    const profile = deriveQuitProfile(req.body, req.user.id);

    if (!profile) {
      return res.status(400).json({ message: "Please complete every setup question before continuing." });
    }

    const result = await query(
      `INSERT INTO quit_profiles (
        id, user_id, quit_reason, vapes_per_week, vaping_history, cost_per_vape,
        days_per_vape, quit_goal, estimated_daily_vape_usage, estimated_daily_spend,
        quit_start_date, setup_completed_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        profile.id,
        profile.userId,
        profile.quitReason,
        profile.vapesPerWeek,
        profile.vapingHistory,
        profile.costPerVape,
        profile.daysPerVape,
        profile.quitGoal,
        profile.estimatedDailyVapeUsage,
        profile.estimatedDailySpend,
        profile.quitStartDate,
        profile.setupCompletedAt,
        profile.updatedAt,
      ]
    );

    return res.status(201).json({ quitProfile: mapQuitProfile(result.rows[0]) });
  })
);

app.get(
  "/quit-profile/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await query("SELECT * FROM quit_profiles WHERE user_id = $1", [req.user.id]);
    const profile = mapQuitProfile(result.rows[0]);

    if (!profile) {
      return res.status(404).json({ message: "Quit profile has not been set up yet." });
    }

    return res.json({ quitProfile: profile });
  })
);

app.get(
  "/progress/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await query("SELECT * FROM quit_profiles WHERE user_id = $1", [req.user.id]);
    const profile = mapQuitProfile(result.rows[0]);

    if (!profile) {
      return res.status(404).json({ message: "Quit profile has not been set up yet." });
    }

    return res.json({ progress: calculateProgress(profile) });
  })
);
app.patch(
  "/quit-profile/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const existingResult = await query("SELECT * FROM quit_profiles WHERE user_id = $1", [req.user.id]);
    const existingProfile = mapQuitProfile(existingResult.rows[0]);

    if (!existingProfile) {
      return res.status(404).json({ message: "Quit profile has not been set up yet." });
    }

    const profile = deriveQuitProfile({ ...existingProfile, ...req.body }, req.user.id, existingProfile);

    if (!profile) {
      return res.status(400).json({ message: "Please provide valid quit profile values." });
    }

    const result = await query(
      `UPDATE quit_profiles
       SET quit_reason = $1, vapes_per_week = $2, vaping_history = $3, cost_per_vape = $4,
           days_per_vape = $5, quit_goal = $6, estimated_daily_vape_usage = $7,
           estimated_daily_spend = $8, updated_at = $9
       WHERE user_id = $10
       RETURNING *`,
      [
        profile.quitReason,
        profile.vapesPerWeek,
        profile.vapingHistory,
        profile.costPerVape,
        profile.daysPerVape,
        profile.quitGoal,
        profile.estimatedDailyVapeUsage,
        profile.estimatedDailySpend,
        profile.updatedAt,
        req.user.id,
      ]
    );

    return res.json({ quitProfile: mapQuitProfile(result.rows[0]) });
  })
);

app.use((error, req, res, next) => {
  console.error(error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
});

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });

