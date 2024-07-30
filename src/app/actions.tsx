"use server";

import { auth } from "@/auth";
import { openai } from "@ai-sdk/openai";
import { QueryResultRow, sql } from "@vercel/postgres";
import { CoreMessage, generateObject } from "ai";
import { z } from "zod";
import {
  ErrorCodes,
  ErrorResponse,
  NextStoryPart,
  Story,
  StoryDescription,
} from "./models/models";
const isoCountriesLanguages = require("iso-countries-languages");

const STORY_LENGTH_LIMIT = 8;

function toPostgresArray(arr: string[]): string {
  return JSON.stringify(arr).replace("[", "{").replace("]", "}");
}

async function getStoryAndParts(id: string, owner: string) {
  let { rows } =
    await sql`SELECT * FROM ai_choose_story.stories WHERE id = ${id} AND (owner = ${owner} OR public = true)`;
  if (rows.length === 0) {
    throw new Error("Story not found");
  }

  const result: Story = {
    id: rows[0].id,
    title: rows[0].title,
    genre: rows[0].genre,
    lang: rows[0].lang,
    story: [],
    choices: rows[0].choices,
    status: rows[0].status,
    public: rows[0].public,
    likes: rows[0].likes,
  };

  ({ rows } =
    await sql`SELECT part_text FROM ai_choose_story.story_parts WHERE story_id = ${id} ORDER BY part_id ASC`);
  rows.forEach((row) => result.story.push(row.part_text));

  return result;
}

export async function updateStoryPublish(id: string, value: boolean) {
  const session = await auth();
  if (!session) {
    return { message: "Not authenticated", code: ErrorCodes.NotAuthenticated };
  }

  await sql`UPDATE ai_choose_story.stories SET public = ${value} WHERE id = ${id} and owner = ${session.user?.email}`;
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
      lang: row.lang,
      lastUpdated: row.last_updated,
      status: row.status,
      public: row.public,
      likes: row.likes,
    };
  });
}

interface PublicStoryFilter {
  genre?: string;
  lang?: string;
}

export async function getPublicStories(
  filter?: PublicStoryFilter
): Promise<StoryDescription[] | ErrorResponse> {
  const hasLang = filter && filter.lang
  const hasGenre = filter && filter.genre
  let rows: QueryResultRow[];
  if (!hasLang && !hasGenre) {
    ({ rows } = await sql`SELECT * FROM ai_choose_story.stories WHERE public = true ORDER BY last_updated DESC LIMIT 10`);
  } else if (hasLang && hasGenre) {
    ({ rows } = await sql`SELECT * FROM ai_choose_story.stories WHERE public = true AND lang = ${filter.lang} AND genre = ${filter.genre} ORDER BY last_updated DESC LIMIT 10`);
  } else if (hasLang) {
    ({ rows } = await sql`SELECT * FROM ai_choose_story.stories WHERE public = true AND lang = ${filter.lang} ORDER BY last_updated DESC LIMIT 10`);
  } else {
    ({ rows } = await sql`SELECT * FROM ai_choose_story.stories WHERE public = true AND genre = ${filter.genre} ORDER BY last_updated DESC LIMIT 10`);
  }
  return rows.map((row) => {
    return {
      id: row.id,
      title: row.title,
      genre: row.genre,
      lang: row.lang,
      lastUpdated: row.last_updated,
      status: row.status,
      public: row.public,
      likes: row.likes,
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

export async function beginStory(
  title: string,
  genre: string,
  lang: string
): Promise<string | ErrorResponse> {
  const session = await auth();
  if (!session) {
    return { message: "Not authenticated", code: ErrorCodes.NotAuthenticated };
  }

  var languageInSpanish = isoCountriesLanguages.getLanguage("es", lang);

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: `Eres un experto narrador de historias. Vas a inventarte una historia titulada "${title}". El género de la historia es "${genre}".
            Vas a ir escribiendo la historia haciendo pausas presentando al usuario varias opciones sobre como seguirla.
            La historia debes escribirla en la variable story.
            Las opciones ponlas en la variable choices.
            Es muy importante que no escribas las opciones en la variable story, solo en la variable choices.
            También es importante que no escribas preguntas para el usuario en la variable story, solo la historia.
            La historia debes escribirla en el idioma "${languageInSpanish}"`,
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

  const status = object.choices.length === 0 ? "FINISHED" : "IN_PROGRESS";
  const choices = toPostgresArray(object.choices);

  let { rows } =
    await sql`INSERT INTO ai_choose_story.stories (title, genre, lang, choices, owner, last_updated, status) VALUES (${title}, ${genre}, ${lang}, ${choices}, ${session.user?.email}, NOW(), ${status}) RETURNING *`;
  if (rows.length === 0) {
    return { message: "Error creating story", code: 500 };
  }
  const storyId = rows[0].id;
  await sql`INSERT INTO ai_choose_story.story_parts (story_id, part_text) VALUES (${storyId}, ${object.story})`;

  return storyId;
}

export async function getNextStoryPart(
  id: string,
  choice: string,
  lang: string
): Promise<NextStoryPart | ErrorResponse> {
  var languageInSpanish = isoCountriesLanguages.getLanguage("es", lang);

  const session = await auth();
  if (!session) {
    return { message: "Not authenticated", code: ErrorCodes.NotAuthenticated };
  }
  let story = await getStoryAndParts(id, session.user?.email!);
  if (story.story.length > STORY_LENGTH_LIMIT) {
    return getNextStoryPartAimingForEnd(story, choice, languageInSpanish);
  }

  const currentStory = story.story.join("\n");

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: `Eres un experto narrador de historias. Vas a inventarte una historia titulada "${story.title}". El género de la historia es "${story.genre}".
            La historia hasta este momento es la siguiente: "${currentStory}".
            Vas a seguir desarrollando la historia teniendo en cuenta la opción que ha elegido el usuario para continuar, haciendo pausas presentando al usuario varias opciones sobre como seguirla.
            La historia debes escribirla en la variable story.
            Si la historia ha terminado, devuelve en la variable choices un array vacío. No tengas miedo en castigar al usuario si ha escogido una mala opción.
            Las opciones ponlas en la variable choices.
            Es muy importante que no escribas las opciones en la variable story, solo en la variable choices.
            También es importante que no escribas preguntas para el usuario en la variable story, solo la historia.
            La historia debes escribirla en el idioma "${languageInSpanish}"`,
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

  const status = object.choices.length === 0 ? "FINISHED" : "IN_PROGRESS";

  await sql`INSERT INTO ai_choose_story.story_parts (story_id, part_text) VALUES (${story.id}, ${object.story}) RETURNING part_id`;
  await sql`UPDATE ai_choose_story.stories SET choices = ${toPostgresArray(
    object.choices
  )}, last_updated = NOW(), status=${status} WHERE id = ${story.id}`;

  return {
    story: object.story,
    choices: object.choices,
  };
}

export async function getNextStoryPartAimingForEnd(
  story: Story,
  choice: string,
  languageInSpanish: string
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
            Si la historia ha terminado, devuelve en la variable choices un array vacío. No tengas miedo en castigar al usuario si ha escogido una mala opción.
            Las opciones ponlas en la variable choices.
            No escribas las opciones en la historia, solo en la variable choices.
            Tampoco escribas en la variable story preguntas para el usuario, solo la historia.
            La historia debes escribirla en el idioma "${languageInSpanish}"`,
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
  const status = object.choices.length === 0 ? "FINISHED" : "IN_PROGRESS";
  await sql`INSERT INTO ai_choose_story.story_parts (story_id, part_text) VALUES (${story.id}, ${object.story}) RETURNING part_id`;
  await sql`UPDATE ai_choose_story.stories SET choices = ${toPostgresArray(
    object.choices
  )}, last_updated = NOW(), status = ${status} WHERE id = ${story.id}`;

  return {
    story: object.story,
    choices: object.choices,
  };
}

export async function deleteStory(id: string) {
  const session = await auth();
  if (!session) {
    return { message: "Not authenticated", code: ErrorCodes.NotAuthenticated };
  }

  await sql`DELETE FROM ai_choose_story.stories WHERE id = ${id} and owner = ${session.user?.email}`;
}
