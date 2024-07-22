import { config } from "dotenv";
import { sql } from "@vercel/postgres";

// Load the .env.local properties
config({ path: ".env.local" });

async function main() {
  console.log("Initializing database...");
  await sql`DROP SCHEMA IF EXISTS ai_choose_story CASCADE`;
  await sql`CREATE SCHEMA ai_choose_story`;
  await sql`CREATE table ai_choose_story.stories (
        id serial primary key,
        title text,
        genre text,
        story text[],
        choices text[],
        owner text,
        last_updated timestamp
    )`;

}

main();
