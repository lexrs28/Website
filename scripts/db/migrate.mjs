#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const migrationsDir = path.join(process.cwd(), "db", "migrations");
const isCheckMode = process.argv.includes("--check");

function requireDatabaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }
  return value;
}

function shouldRequireSsl(databaseUrl) {
  return !/localhost|127\.0\.0\.1/i.test(databaseUrl);
}

async function getMigrationFiles() {
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function ensureMigrationsTable(sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      file_name TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(sql) {
  const rows = await sql`
    SELECT file_name
    FROM schema_migrations
  `;
  return new Set(rows.map((row) => row.file_name));
}

async function applyMigration(sql, fileName) {
  const fullPath = path.join(migrationsDir, fileName);
  const content = await fs.readFile(fullPath, "utf8");

  await sql.begin(async (tx) => {
    await tx.unsafe(content);
    await tx`
      INSERT INTO schema_migrations (file_name)
      VALUES (${fileName})
    `;
  });
}

async function run() {
  const databaseUrl = requireDatabaseUrl();
  const sql = postgres(databaseUrl, {
    prepare: false,
    ssl: shouldRequireSsl(databaseUrl) ? "require" : undefined
  });

  try {
    await ensureMigrationsTable(sql);
    const allMigrations = await getMigrationFiles();
    const applied = await getAppliedMigrations(sql);
    const pending = allMigrations.filter((fileName) => !applied.has(fileName));

    if (isCheckMode) {
      if (pending.length === 0) {
        console.log("No pending migrations.");
        return;
      }

      console.log("Pending migrations:");
      for (const fileName of pending) {
        console.log(`- ${fileName}`);
      }
      process.exitCode = 1;
      return;
    }

    if (pending.length === 0) {
      console.log("No pending migrations. Database is up to date.");
      return;
    }

    for (const fileName of pending) {
      await applyMigration(sql, fileName);
      console.log(`Applied migration: ${fileName}`);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
