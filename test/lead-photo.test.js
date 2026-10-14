import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

async function freePort() {
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  socket.close();
  await once(socket, "close");
  return port;
}

test("an inquiry photo is saved and visible through the admin lead detail", async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "act-photo-test-"));
  const port = await freePort(),
    base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["server.js"], {
    cwd: path.resolve(import.meta.dirname, ".."),
    env: {
      ...process.env,
      ACT_DATA_DIR: dataDir,
      ACT_ADMIN_PASSWORD: "test-photo-admin-password",
      RESEND_API_KEY: "",
      RESEND_FROM_EMAIL: "",
      ACT_LEAD_EMAIL: "",
      PORT: String(port),
      HOST: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Test server did not start.")),
        8000,
      );
      const onData = (data) => {
        if (String(data).includes("listening on")) {
          clearTimeout(timeout);
          resolve();
        }
      };
      child.stdout.on("data", onData);
      child.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      child.once("exit", (code) => {
        clearTimeout(timeout);
        reject(new Error(`Test server exited: ${code}`));
      });
    });
    const photo =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==";
    const inquiry = await fetch(`${base}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Photo Test",
        phone: "304-415-4277",
        service: "Concrete Slab",
        photo,
      }),
    });
    assert.equal(inquiry.status, 201);
    const login = await fetch(`${base}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "test-photo-admin-password" }),
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    const headers = { Cookie: cookie };
    const list = await (
      await fetch(`${base}/api/admin/leads`, { headers })
    ).json();
    assert.equal(list.leads[0].has_photo, 1);
    const id = list.leads[0].id;
    const detail = await (
      await fetch(`${base}/api/admin/leads/${id}`, { headers })
    ).json();
    assert.equal(detail.lead.has_photo, true);
    assert.equal(detail.lead.photo, undefined);
    const image = await fetch(`${base}/api/admin/leads/${id}/photo`, {
      headers,
    });
    assert.equal(image.status, 200);
    assert.match(image.headers.get("content-type"), /image\/png/);
    assert.ok((await image.arrayBuffer()).byteLength > 50);
  } finally {
    child.kill();
    if (child.exitCode === null) await once(child, "exit");
    await rm(dataDir, { recursive: true, force: true });
  }
});
