import { openai } from "@ai-sdk/openai";
import { sql } from "@vercel/postgres";
import { CoreMessage, generateObject } from "ai";
import { z } from "zod";
const isoCountriesLanguages = require("iso-countries-languages");

// const SPANISH = {
//   "home.stories": "Mis Historias",
//   "home.noStories.header": "No has creado ninguna historia",
//   "home.noStories.desc":
//     "Parece que no has creado ninguna historia por ahora. Puedes crear una nueva historia para comenzar.",
//   "home.card.updated": "Actualizada",
//   "home.button.logout": "Cerrar sesión",
//   "home.button.newStory": "Crear Nueva Historia",
//   "home.loading.title": "Cargando Historias",
//   "home.loading.message": "Por favor espera mientras buscamos las historias",
//   "story.genre": "Género",
//   "story.genre.fiction": "Ficción",
//   "story.genre.non-fiction": "No Ficción",
//   "story.genre.fantasy": "Fanstasia",
//   "story.genre.mystery": "Misterio",
//   "story.genre.romance": "Romance",
//   "story.genre.sci-fi": "Ciencia Ficción",
//   "newStory.title": "Crear nueva historia",
//   "newStory.subtitle": "Introduce el título y género de la historia.",
//   "newStory.field.title.label": "Título",
//   "newStory.field.title.placeholder": "Introduce el título de la historia",
//   "newStory.field.genre.label": "Género",
//   "newStory.field.genre.placeholder": "Selecciona un género",
//   "newStory.loading.title": "Creando historia",
//   "newStory.loading.message": "Por favor espera mientras se crea la historia",
//   "newStory.button.create": "Crear Historia",
//   "signIn.title": "Bienvenido!",
//   "signIn.desc": "Inicia sesión utilizando uno de los métodos proporcionados",
//   "signIn.google": "Entrar con Google",
//   "storyView.loading.title": "Continuando historia",
//   "storyView.loading.message": "Por favor espera mientras se crea la historia.",
//   "storyView.menu.fontSize": "Tamaño de fuente",
//   "storyView.menu.fontSize.small": "Pequeña",
//   "storyView.menu.fontSize.medium": "Mediana",
//   "storyView.menu.fontSize.big": "Grande",
//   "storyView.page.previous": "Anterior",
//   "storyView.page.next": "Siguiente",
// };

const ENGLISH = {
  "home.stories": "My Stories",
  "home.noStories.header": "You have not created any stories",
  "home.noStories.desc":
    "It looks like you haven't created any stories yet. You can create a new story to get started.",
  "home.card.updated": "Updated",
  "home.button.logout": "Logout",
  "home.button.newStory": "Create New Story",
  "home.loading.title": "Loading Stories",
  "home.loading.message": "Please wait while we fetch the stories",
  "story.genre": "Genre",
  "story.genre.fiction": "Fiction",
  "story.genre.non-fiction": "Non-Fiction",
  "story.genre.fantasy": "Fantasy",
  "story.genre.mystery": "Mystery",
  "story.genre.romance": "Romance",
  "story.genre.sci-fi": "Science Fiction",
  "newStory.title": "Create New Story",
  "newStory.subtitle": "Enter the story's title and genre.",
  "newStory.field.title.label": "Title",
  "newStory.field.title.placeholder": "Enter the story's title",
  "newStory.field.genre.label": "Genre",
  "newStory.field.genre.placeholder": "Select a genre",
  "newStory.loading.title": "Creating Story",
  "newStory.loading.message": "Please wait while the story is being created",
  "newStory.button.create": "Create Story",
  "signIn.title": "Welcome!",
  "signIn.desc": "Sign in using one of the provided methods",
  "signIn.google": "Sign in with Google",
  "storyView.loading.title": "Continuing Story",
  "storyView.loading.message": "Please wait while the story is being created.",
  "storyView.menu.fontSize": "Font Size",
  "storyView.menu.fontSize.small": "Small",
  "storyView.menu.fontSize.medium": "Medium",
  "storyView.menu.fontSize.big": "Large",
  "storyView.page.previous": "Previous",
  "storyView.page.next": "Next",
};

async function getDictionaryFromPostgres(lang: string) {
  let { rows } =
    await sql`SELECT * FROM ai_choose_story.translations WHERE language = ${lang}`;
  if (rows.length === 0) {
    return null;
  }
  return rows[0].translations;
}

async function saveDictionary(lang: string, dictionaryFromAI: any) {
  const json = JSON.stringify(dictionaryFromAI)
  await sql`INSERT INTO ai_choose_story.translations (language, translations) VALUES (${lang}, ${json}) RETURNING *`
}

async function getDictionaryFromAI(languageInEnglish: string) {
  const messages: CoreMessage[] = [
    {
      role: "system",
      content: `You are an expert translator from English to other languages.
      You will be in charge of translating a json written in English into the language that the user tells you.
      The json has several keys and values. You should not modify the keys, you should only change the values ​​to the language that the user tells you`,
    },
    {
      role: "user",
      content: `Please, translate this json to ${languageInEnglish}: ${JSON.stringify(
        ENGLISH
      )}`,
    },
  ];
  const model = openai("gpt-4o-mini");

  let schemaObject: any = {};
  Object.keys(ENGLISH).forEach((key) => {
    schemaObject[key] = z.string();
  });
  const schema = z.object(schemaObject);

  const { object } = await generateObject({
    model: model,
    schema: schema,
    messages: messages,
  });

  return object
}

export async function getDictionary(lang: string) {
  if (lang === "en") {
    return ENGLISH;
  } else {
    if (isoCountriesLanguages.getSupportedLangs().includes(lang)) {
      var languageInPostgres = await getDictionaryFromPostgres(lang);
      if (languageInPostgres) {
        return languageInPostgres;
      }
      var languageInEnglish = isoCountriesLanguages.getLanguage("en", lang);
      const dictionaryFromAI = await getDictionaryFromAI(languageInEnglish);
      await saveDictionary(lang, dictionaryFromAI)
      return dictionaryFromAI
    } else {
      throw new Error("Language not supported");
    }
  }
}
