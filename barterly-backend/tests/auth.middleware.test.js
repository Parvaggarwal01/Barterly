import { test, describe } from "node:test";
import assert from "node:assert";
import { checkRole } from "../src/middlewares/auth.middleware.js";

describe("checkRole Middleware", () => {
  test("should call next() if user has the allowed role", () => {
    const middleware = checkRole("admin", "superadmin");
    const req = { user: { role: "admin" } };
    const res = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    middleware(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  test("should return 401 if req.user is undefined", () => {
    const middleware = checkRole("admin");
    const req = {};
    let statusCode;
    let responseBody;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => {
            responseBody = body;
          },
        };
      },
    };
    const next = () => {
      assert.fail("next() should not be called");
    };

    middleware(req, res, next);
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(responseBody.message, "Authentication required");
  });

  test("should return 403 if user role is not allowed", () => {
    const middleware = checkRole("admin");
    const req = { user: { role: "user" } };
    let statusCode;
    let responseBody;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => {
            responseBody = body;
          },
        };
      },
    };
    const next = () => {
      assert.fail("next() should not be called");
    };

    middleware(req, res, next);
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(
      responseBody.message,
      "You do not have permission to perform this action"
    );
  });
});
