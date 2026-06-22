import test, { describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import express from "express";
import adminRoutes from "../src/routes/admin.routes.js";
import { generateAccessToken } from "../src/utils/jwt.utils.js";
import mongoose from "mongoose";
import User from "../src/models/User.model.js";

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
    
    User.findById = (id) => ({
      select: () => Promise.resolve({
        _id: id,
        isActive: true,
        role: "user"
      })
    });

    const token = generateAccessToken({ _id: "dummy-id" });

    const response = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.message, "You do not have permission to perform this action");

    User.findById = originalFindById;
  });

  test("should allow access to user with admin role", async () => {
    const originalFindById = User.findById;
    
    User.findById = (id) => ({
      select: () => Promise.resolve({
        _id: id,
        isActive: true,
        role: "admin"
      })
    });

    const token = generateAccessToken({ _id: "admin-id" });

    // Assuming we mock controller to return 200, but wait, the controller is real.
    // If the controller hits DB, it might fail. Let's just expect it not to be 401 or 403.
    const response = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${token}`);

    // Assuming controller returns 500 without DB, or 200 if no DB dependency. 
    // We just verify it bypasses auth (not 401/403).
    assert.notEqual(response.status, 401);
    assert.notEqual(response.status, 403);

    User.findById = originalFindById;
  });
});
