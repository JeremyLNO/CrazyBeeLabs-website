/** Client-side Paddle configuration. NEXT_PUBLIC_* values are inlined at build. */

export function paddleClientToken(): string | undefined {
  return process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || undefined;
}

export function paddleEnv(): "sandbox" | "production" {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "production"
    : "sandbox";
}

export function isPaddleClientConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
}
