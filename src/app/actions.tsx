"use server";

import { auth } from "@/auth";
import { openai } from "@ai-sdk/openai";
import { CoreMessage, generateObject } from "ai";
import { z } from "zod";
import {
  ErrorCodes,
  ErrorResponse,
  NextStoryPart,
  Story,
  StoryDescription,
} from "./models/models";
import { sql } from "@vercel/postgres";

const STORY_LENGTH_LIMIT = 8;

function toPostgresArray(arr: string[]): string {
  return JSON.stringify(arr).replace("[", "{").replace("]", "}");
}

async function getStoryAndParts(id: string, owner: string) {
  let { rows } =
    await sql`SELECT * FROM ai_choose_story.stories WHERE id = ${id} AND owner = ${owner}`;
  if (rows.length === 0) {
    throw new Error("Story not found");
  }

  const result: Story = {
    id: rows[0].id,
    title: rows[0].title,
    genre: rows[0].genre,
    story: [],
    choices: rows[0].choices,
  };

  ({ rows } =
    await sql`SELECT part_text FROM ai_choose_story.story_parts WHERE part_id IN (SELECT part_id FROM ai_choose_story.story_story_parts WHERE story_id = ${id})`);
  rows.forEach((row) => result.story.push(row.part_text));

  return result;
}

export async function getStories(): Promise<
  StoryDescription[] | ErrorResponse
> {
  const session = await auth();
  if (!session) {
    return { message: "Not authenticated", code: ErrorCodes.NotAuthenticated };
  }
  const { rows } =
    await sql`SELECT * FROM ai_choose_story.stories WHERE owner = ${session.user?.email} ORDER BY last_updated DESC`;
  return rows.map((row) => {
    return {
      id: row.id,
      title: row.title,
      genre: row.genre,
      lastUpdated: row.last_updated,
    };
  });
}

export async function getStory(id: string): Promise<Story | ErrorResponse> {
  const session = await auth();
  if (!session) {
    return { message: "Not authenticated", code: ErrorCodes.NotAuthenticated };
  }
  return getStoryAndParts(id, session.user?.email!);
}

export async function beginStory(title: string, genre: string) {
  const session = await auth();
  if (!session) {
    return { message: "Not authenticated", code: ErrorCodes.NotAuthenticated };
  }

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: `Eres un experto narrador de historias. Vas a inventarte una historia titulada "${title}". El género de la historia es "${genre}".
            Vas a ir escribiendo la historia haciendo pausas presentando al usuario varias opciones sobre como seguirla.
            La historia debes escribirla en la variable story.
            Las opciones ponlas en la variable choices.
            No escribas las opciones en la historia, solo en la variable choices.
            Tampoco escribas en la variable story preguntas para el usuario, solo la historia.`,
    },
  ];
  const model = openai("gpt-4o-mini");

  const { object } = await generateObject({
    model: model,
    schema: z.object({
      story: z.string(),
      choices: z.array(z.string()),
    }),
    messages: messages,
  });
  // Assuming each story part is separated by a specific delimiter for simplicity
  let { rows } =
    await sql`INSERT INTO ai_choose_story.story_parts (part_text) VALUES (${object.story}) RETURNING part_id`;

  const insertedPart = rows[0].part_id;
  const choices = toPostgresArray(object.choices);
  ({ rows } =
    await sql`INSERT INTO ai_choose_story.stories (title, genre, choices, owner, last_updated) VALUES (${title}, ${genre}, ${choices}, ${session.user?.email}, NOW()) RETURNING *`);
  if (rows.length === 0) {
    return { message: "Error creating story", code: 500 };
  }
  const storyId = rows[0].id;

  // Add the relation in story_story_parts
  await sql`INSERT INTO ai_choose_story.story_story_parts (story_id, part_id) VALUES (${storyId}, ${insertedPart})`;

  return storyId;
}

export async function getNextStoryPart(
  id: string,
  choice: string
): Promise<NextStoryPart | ErrorResponse> {
  const session = await auth();
  if (!session) {
    return { message: "Not authenticated", code: ErrorCodes.NotAuthenticated };
  }
  let story = await getStoryAndParts(id, session.user?.email!);
  if (story.story.length > STORY_LENGTH_LIMIT) {
    return getNextStoryPartAimingForEnd(story, choice);
  }

  const currentStory = story.story.join("\n");

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: `Eres un experto narrador de historias. Vas a inventarte una historia titulada "${story.title}". El género de la historia es "${story.genre}".
            La historia hasta este momento es la siguiente: "${currentStory}".
            Vas a seguir desarrollando la historia teniendo en cuenta la opción que ha elegido el usuario para continuar, haciendo pausas presentando al usuario varias opciones sobre como seguirla.
            La historia debes escribirla en la variable story.
            Si la historia ha terminado, devuelve en la variable choices un array vacío.
            Las opciones ponlas en la variable choices.
            No escribas las opciones en la historia, solo en la variable choices.
            Tampoco escribas en la variable story preguntas para el usuario, solo la historia.`,
    },
    {
      role: "user",
      content: choice,
    },
  ];
  const model = openai("gpt-4o-mini");

  const { object } = await generateObject({
    model: model,
    schema: z.object({
      story: z.string(),
      choices: z.array(z.string()),
    }),
    messages: messages,
  });

  const { rows } =
    await sql`INSERT INTO ai_choose_story.story_parts (part_text) VALUES (${object.story}) RETURNING part_id`;
  const part_id = rows[0].part_id;
  await sql`INSERT INTO ai_choose_story.story_story_parts (story_id, part_id) VALUES (${id}, ${part_id})`;
  await sql`UPDATE ai_choose_story.stories SET choices = ${toPostgresArray(
    object.choices
  )}, last_updated = NOW() WHERE id = ${id}`;

  return {
    story: object.story,
    choices: object.choices,
  };
}

export async function getNextStoryPartAimingForEnd(
  story: Story,
  choice: string
): Promise<NextStoryPart | ErrorResponse> {
  const currentStory = story.story.join("\n");

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: `Eres un experto narrador de historias. Vas a inventarte una historia titulada "${story.title}". El género de la historia es "${story.genre}".
            La historia hasta este momento es la siguiente: "${currentStory}".
            Vas a seguir desarrollando la historia llevandola hacia un final teniendo en cuenta la opción que ha elegido el usuario para continuar, haciendo pausas presentando al usuario varias opciones sobre como seguirla.
            Debes hacer que la historia termine en las próximas iteraciones.
            La historia debes escribirla en la variable story.
            Si la historia ha terminado, devuelve en la variable choices un array vacío.
            Las opciones ponlas en la variable choices.
            No escribas las opciones en la historia, solo en la variable choices.
            Tampoco escribas en la variable story preguntas para el usuario, solo la historia.`,
    },
    {
      role: "user",
      content: choice,
    },
  ];
  const model = openai("gpt-4o-mini");

  const { object } = await generateObject({
    model: model,
    schema: z.object({
      story: z.string(),
      choices: z.array(z.string()),
    }),
    messages: messages,
  });
  const { rows } =
    await sql`INSERT INTO ai_choose_story.story_parts (part_text) VALUES (${object.story}) RETURNING part_id`;
  const part_id = rows[0].part_id;
  await sql`INSERT INTO ai_choose_story.story_story_parts (story_id, part_id) VALUES (${story.id}, ${part_id})`;
  await sql`UPDATE ai_choose_story.stories SET choices = ${toPostgresArray(
    object.choices
  )}, last_updated = NOW() WHERE id = ${story.id}`;

  return {
    story: object.story,
    choices: object.choices,
  };
}
