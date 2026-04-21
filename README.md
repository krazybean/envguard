# envguard

The fastest way to make broken environment variables fail before your app does.

![envguard demo](./media/demo.gif)

## Why This Exists

Most apps trust `process.env` until something explodes in production.
A missing `DATABASE_URL` or invalid `PORT` often fails late, far from startup.
That means confusing runtime crashes, noisy logs, and slow debugging.
You should know your environment is valid the moment your app boots.

## The Fix

```ts
import { loadEnv } from "envguard";

const env = loadEnv({
  PORT: "number",
  DATABASE_URL: "string",
});
```
