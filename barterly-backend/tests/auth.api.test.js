import request from "supertest";
import app from "../src/app.js";
import mongoose from "mongoose";

describe("Auth API Endpoints", () => {
  const testUser = {
    name: "Test User",
    email: "testuser@example.com",
    password: "StrongPassword123!",
  };

  test("POST /api/auth/register - success", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Registration successful");
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("POST /api/auth/register - validation failure (weak password)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "testuser@example.com",
        password: "123",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/login - success after registration", async () => {
    // Register first
    await request(app)
      .post("/api/auth/register")
      .send(testUser);

    // Verify email directly in DB since email worker is mocked/asynchronous
    const User = mongoose.model("User");
    await User.updateOne({ email: testUser.email }, { isVerified: true });

    // Try login
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  test("POST /api/auth/login - invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "WrongPassword1!",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
