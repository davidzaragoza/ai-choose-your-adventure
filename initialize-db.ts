import { config } from "dotenv";
import { sql } from "@vercel/postgres";

// Load the .env.local properties
config({ path: ".env.local" });

async function main() {
  console.log("Initializing database...");
  await sql`DROP SCHEMA IF EXISTS ai_choose_story CASCADE`;
  await sql`CREATE SCHEMA ai_choose_story`;
  await sql`CREATE TABLE ai_choose_story.stories (
    id serial primary key,
    title text,
    genre text,
    lang text,
    choices text[],
    owner text,
    last_updated timestamp,
    status text,
    public boolean DEFAULT false,
    likes integer DEFAULT 0
  )`;
  await sql`CREATE TABLE ai_choose_story.story_parts (
    part_id serial primary key,
    story_id integer references ai_choose_story.stories(id) ON DELETE CASCADE,
    part_text text
  )`;
  await sql`CREATE TABLE ai_choose_story.translations (
    language text primary key,
    translations json
  )`;
  await sql`CREATE TABLE ai_choose_story.story_likes (
    story_id integer references ai_choose_story.stories(id) ON DELETE CASCADE,
    user_id text
  )`;
}

main();
