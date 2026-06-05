#!/usr/bin/env node
// Wrapper que mantém o `vite dev` rodando: se o processo morrer
// (por exemplo, após restart interno disparado por mudança no .env),
// reinicia automaticamente em vez de encerrar o script de dev.
import { spawn } from "node:child_process";

const args = ["dev", ...process.argv.slice(2)];
let shuttingDown = false;
let current = null;

function start() {
  current = spawn("vite", args, { stdio: "inherit", shell: false });

  current.on("exit", (code, signal) => {
    current = null;
    if (shuttingDown) {
      process.exit(code ?? 0);
      return;
    }
    // Restart on any non-clean exit (crash, SIGTERM from internal restart, etc.)
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`\n[dev-wrapper] vite saiu (${reason}). Reiniciando em 300ms...`);
    setTimeout(start, 300);
  });

  current.on("error", (err) => {
    console.error("[dev-wrapper] falha ao iniciar vite:", err);
  });
}

function shutdown(signal) {
  shuttingDown = true;
  if (current) current.kill(signal);
  else process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();
