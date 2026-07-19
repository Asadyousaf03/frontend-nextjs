import { GoogleAuth } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function backendBase(): string {
  return (
    process.env.CLOUD_RUN_URL ||
    process.env.API_UPSTREAM_URL ||
    "https://genomic-ast-api-67343763423.us-central1.run.app"
  ).replace(/\/+$/, "");
}

function loadCredentials(): object | undefined {
  const raw = process.env.GCP_SA_JSON;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as object;
  } catch {
    // Support base64-encoded JSON for easier Vercel env pasting.
    try {
      return JSON.parse(
        Buffer.from(raw, "base64").toString("utf8"),
      ) as object;
    } catch {
      return undefined;
    }
  }
}

async function authHeaders(targetUrl: string): Promise<HeadersInit> {
  const credentials = loadCredentials();
  if (!credentials) {
    return {};
  }
  const auth = new GoogleAuth({ credentials });
  const client = await auth.getIdTokenClient(backendBase());
  const headers = await client.getRequestHeaders(targetUrl);
  return headers;
}

async function proxy(request: NextRequest, pathParts: string[]) {
  const path = pathParts.join("/");
  const search = request.nextUrl.search || "";
  const target = `${backendBase()}/${path}${search}`;

  const headers = new Headers(await authHeaders(target));
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);
  const lastEventId = request.headers.get("last-event-id");
  if (lastEventId) headers.set("last-event-id", lastEventId);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    // @ts-expect-error undici duplex needed for streaming bodies in Node
    duplex: "half",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  const upstream = await fetch(target, init);
  const responseHeaders = new Headers();
  const passThrough = [
    "content-type",
    "cache-control",
    "x-accel-buffering",
    "connection",
  ];
  for (const key of passThrough) {
    const value = upstream.headers.get(key);
    if (value) responseHeaders.set(key, value);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}
