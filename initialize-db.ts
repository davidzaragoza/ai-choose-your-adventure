import { config } from "dotenv";
import { sql } from "@vercel/postgres";

// Load the .env.local properties
config({ path: ".env.local" });

async function main() {
  console.log("Initializing database...");
  await sql`DROP SCHEMA IF EXISTS ai_choose_story CASCADE`;
  await sql`CREATE SCHEMA ai_choose_story`;
  await sql`CREATE TABLE ai_choose_story.story_parts (
    part_id serial primary key,
    part_text text
  )`;
  await sql`CREATE TABLE ai_choose_story.stories (
    id serial primary key,
    title text,
    genre text,
    choices text[],
    owner text,
    last_updated timestamp
  )`;
  await sql`CREATE TABLE ai_choose_story.story_story_parts (
    story_id integer REFERENCES ai_choose_story.stories(id),
    part_id integer REFERENCES ai_choose_story.story_parts(part_id),
    PRIMARY KEY (story_id, part_id)
  )`;
}

main();
