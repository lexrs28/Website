import postgres from "postgres";

function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new Error("DATABASE_URL is required for database access.");
  }
  return value;
}

function shouldRequireSsl(databaseUrl: string): boolean {
  return !/localhost|127\.0\.0\.1/i.test(databaseUrl);
}

type SqlClient = ReturnType<typeof postgres>;

declare global {
  var __academicSiteSqlClient: SqlClient | undefined;
}

export function getSqlClient(): SqlClient {
  if (global.__academicSiteSqlClient) {
    return global.__academicSiteSqlClient;
  }

  const databaseUrl = getDatabaseUrl();
  const sql = postgres(databaseUrl, {
    prepare: false,
    ssl: shouldRequireSsl(databaseUrl) ? "require" : undefined
  });

  global.__academicSiteSqlClient = sql;
  return sql;
}
