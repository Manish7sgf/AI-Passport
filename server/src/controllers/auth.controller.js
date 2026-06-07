const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const UserModel = require("../models/user.model");
const PassportModel = require("../models/passport.model");

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";

const AuthController = {
  async register(req, res, next) {
    try {
      const { email, name, password } = req.body;

      if (!email || !name || !password) {
        return res.status(400).json({ success: false, error: "Email, name and password are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
      }

      const existing = UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ success: false, error: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = UserModel.create({ email, name, passwordHash });
      PassportModel.create(user.id);

      const token = signToken(user.id);
      res.status(201).json({
        success: true,
        data: { token, user: { id: user.id, email: user.email, name: user.name } }
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email and password are required" });
      }

      const user = UserModel.findByEmail(email);
      if (!user || !user.password_hash) {
        return res.status(401).json({ success: false, error: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, error: "Invalid email or password" });
      }

      const token = signToken(user.id);
      res.json({
        success: true,
        data: { token, user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url } }
      });
    } catch (err) {
      next(err);
    }
  },

  githubRedirect(req, res) {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      scope: "read:user,user:email"
    });
    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
  },

  async githubCallback(req, res, next) {
    try {
      const { code } = req.query;
      if (!code) return res.redirect(`${FRONTEND_URL}/auth?error=github_denied`);

      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code
        })
      });

      const tokenData = await tokenResponse.json();
      if (tokenData.error || !tokenData.access_token) {
        return res.redirect(`${FRONTEND_URL}/auth?error=github_token_failed`);
      }

      const profileResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${tokenData.access_token}`,
          Accept: "application/vnd.github.v3+json"
        }
      });
      const profile = await profileResponse.json();

      let email = profile.email;
      if (!email) {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
          headers: { Authorization: `token ${tokenData.access_token}`, Accept: "application/vnd.github.v3+json" }
        });
        const emails = await emailsRes.json();
        const primary = emails.find((e) => e.primary && e.verified);
        email = primary ? primary.email : `${profile.login}@github.local`;
      }

      const user = UserModel.upsertGithubUser({
        email,
        name: profile.name || profile.login,
        githubUsername: profile.login,
        githubToken: tokenData.access_token,
        avatarUrl: profile.avatar_url
      });

      PassportModel.create(user.id);
      const token = signToken(user.id);
      res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (err) {
      next(err);
    }
  },

  me(req, res) {
    res.json({ success: true, data: { user: req.user } });
  }
};

module.exports = AuthController;
