import test, { describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import express from "express";
import adminRoutes from "../src/routes/admin.routes.js";
import jwt from "jsonwebtoken";
import User from "../src/models/User.model.js";

process.env.JWT_ACCESS_SECRET = "deterministic_test_secret_for_rbac";

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("Admin Routes Integration Test", () => {
  test("should deny access to non-authenticated users", async () => {
    const response = await request(app).get("/api/admin/stats");
    assert.equal(response.status, 401);
  });
  
  test("should deny access to user with incorrect role", async () => {
    // Generate token without inserting to DB, since our middleware tries to fetch from DB
    // We will mock the DB call or just expect failure if DB isn't connected.
    // Wait, testing routes requires mocking DB if we don't spin up a Mongo Memory Server.
    // Let's just create a small mock for User.findById to avoid DB issues.
    const originalFindById = User.findById;
    try {
      User.findById = (id) => ({
        select: () => Promise.resolve({
          _id: id,
          isActive: true,
          role: "user"
        })
      });

      const token = jwt.sign({ userId: "dummy-id" }, process.env.JWT_ACCESS_SECRET);

      const response = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${token}`);

      assert.equal(response.status, 403);
      assert.equal(response.body.message, "You do not have permission to perform this action");
    } finally {
      User.findById = originalFindById;
    }
  });

  test("should allow access to user with admin role", async () => {
    const originalFindById = User.findById;
    try {
      User.findById = (id) => ({
        select: () => Promise.resolve({
          _id: id,
          isActive: true,
          role: "admin"
        })
      });

      const token = jwt.sign({ userId: "admin-id" }, process.env.JWT_ACCESS_SECRET);

      const response = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${token}`);

      assert.notEqual(response.status, 401);
      assert.notEqual(response.status, 403);
    } finally {
      User.findById = originalFindById;
    }
  });
});
