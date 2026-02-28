// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from "vitest";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

// Mock "server-only" to allow importing in test environment
vi.mock("server-only", () => ({}));

// Mock next/headers cookies
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

import {
  createSession,
  getSession,
  deleteSession,
  verifySession,
} from "@/lib/auth";

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createSession", () => {
  test("sets an httpOnly cookie with a valid JWT", async () => {
    await createSession("user-1", "test@example.com");

    expect(mockCookieStore.set).toHaveBeenCalledOnce();
    const [name, token, options] = mockCookieStore.set.mock.calls[0];

    expect(name).toBe("auth-token");
    expect(typeof token).toBe("string");
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");

    // Verify the token is a valid JWT with correct payload
    const { payload } = await jwtVerify(token, JWT_SECRET);
    expect(payload.userId).toBe("user-1");
    expect(payload.email).toBe("test@example.com");
  });

  test("sets cookie expiration to 7 days from now", async () => {
    const before = Date.now();
    await createSession("user-1", "test@example.com");
    const after = Date.now();

    const { expires } = mockCookieStore.set.mock.calls[0][2];
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs);
    expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs);
  });

  test("sets secure flag based on NODE_ENV", async () => {
    await createSession("user-1", "test@example.com");

    const options = mockCookieStore.set.mock.calls[0][2];
    // In test environment NODE_ENV is not "production"
    expect(options.secure).toBe(false);
  });
});

async function createToken(
  payload: Record<string, unknown>,
  secret = JWT_SECRET,
  expiration = "7d"
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiration)
    .setIssuedAt()
    .sign(secret);
}

describe("getSession", () => {
  test("returns session payload for a valid token", async () => {
    const token = await createToken({
      userId: "user-1",
      email: "test@example.com",
    });
    mockCookieStore.get.mockReturnValue({ value: token });

    const session = await getSession();
    expect(session).not.toBeNull();
    expect(session!.userId).toBe("user-1");
    expect(session!.email).toBe("test@example.com");
  });

  test("returns null when no cookie is present", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const session = await getSession();
    expect(session).toBeNull();
  });

  test("returns null for an expired token", async () => {
    const token = await createToken(
      { userId: "user-1", email: "a@b.com" },
      JWT_SECRET,
      "0s"
    );
    mockCookieStore.get.mockReturnValue({ value: token });

    const session = await getSession();
    expect(session).toBeNull();
  });

  test("returns null for a token signed with the wrong secret", async () => {
    const wrongSecret = new TextEncoder().encode("wrong-secret");
    const token = await createToken(
      { userId: "user-1", email: "a@b.com" },
      wrongSecret
    );
    mockCookieStore.get.mockReturnValue({ value: token });

    const session = await getSession();
    expect(session).toBeNull();
  });

  test("returns null for a malformed token", async () => {
    mockCookieStore.get.mockReturnValue({ value: "not-a-jwt" });

    const session = await getSession();
    expect(session).toBeNull();
  });
});

describe("deleteSession", () => {
  test("deletes the auth-token cookie", async () => {
    await deleteSession();
    expect(mockCookieStore.delete).toHaveBeenCalledWith("auth-token");
  });
});

describe("verifySession", () => {
  function makeRequest(token?: string): NextRequest {
    if (token) {
      return new NextRequest("http://localhost:3000/", {
        headers: { Cookie: `auth-token=${token}` },
      });
    }
    return new NextRequest("http://localhost:3000/");
  }

  test("returns session payload for a valid token in request cookies", async () => {
    const token = await createToken({
      userId: "user-2",
      email: "req@example.com",
    });

    const session = await verifySession(makeRequest(token));
    expect(session).not.toBeNull();
    expect(session!.userId).toBe("user-2");
    expect(session!.email).toBe("req@example.com");
  });

  test("returns null when request has no auth cookie", async () => {
    const session = await verifySession(makeRequest());
    expect(session).toBeNull();
  });

  test("returns null for an invalid token in request cookies", async () => {
    const session = await verifySession(makeRequest("bad-token"));
    expect(session).toBeNull();
  });

  test("returns null for a token signed with the wrong secret", async () => {
    const wrongSecret = new TextEncoder().encode("wrong-secret");
    const token = await createToken(
      { userId: "user-2", email: "a@b.com" },
      wrongSecret
    );

    const session = await verifySession(makeRequest(token));
    expect(session).toBeNull();
  });
});
