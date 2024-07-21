'use server';

import { openai } from '@ai-sdk/openai';
import { CoreMessage, generateObject } from 'ai';
import { z } from 'zod';

export async function beginStory(title: string, genre: string) {
    const messages: CoreMessage[] = [
        {
            role: 'system',
            content: `Eres un experto narrador de historias. Vas a inventarte una historia titulada "${title}". El género de la historia es "${genre}".
            Vas a ir escribiendo la historia haciendo pausas presentando al usuario varias opciones sobre como seguirla.
            La historia debes escribirla en la variable story.
            Las opciones ponlas en la variable choices.
            No escribas las opciones en la historia, solo en la variable choices.
            Tampoco escribas en la variable story preguntas para el usuario, solo la historia.`,
        }
    ];
    const model = openai('gpt-4o-mini')

    const { object } = await generateObject({
        model: model,
        schema: z.object({
            story: z.string(),
            choices: z.array(z.string()),
        }),
        messages: messages,
    });
    return object;
}

export async function getNextStoryPart(title: string, genre: string, currentStory: string, choice: string) {
    const messages: CoreMessage[] = [
        {
            role: 'system',
            content: `Eres un experto narrador de historias. Vas a inventarte una historia titulada "${title}". El género de la historia es "${genre}".
            La historia hasta este momento es la siguiente: "${currentStory}".
            Vas a seguir desarrollando la historia teniendo en cuenta la opción que ha elegido el usuario para continuar, haciendo pausas presentando al usuario varias opciones sobre como seguirla.
            La historia debes escribirla en la variable story.
            Si la historia ha terminado, devuelve en la variable choices un array vacío.
            Las opciones ponlas en la variable choices.
            No escribas las opciones en la historia, solo en la variable choices.
            Tampoco escribas en la variable story preguntas para el usuario, solo la historia.`,
        },
        {
            role: 'user',
            content: choice,
        }
    ];
    const model = openai('gpt-4o-mini')

    const { object } = await generateObject({
        model: model,
        schema: z.object({
            story: z.string(),
            choices: z.array(z.string()),
        }),
        messages: messages,
    });
    return object;
}

export async function getNextStoryPartAimingForEnd(title: string, genre: string, currentStory: string, choice: string) {
    const messages: CoreMessage[] = [
        {
            role: 'system',
            content: `Eres un experto narrador de historias. Vas a inventarte una historia titulada "${title}". El género de la historia es "${genre}".
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
            role: 'user',
            content: choice,
        }
    ];
    const model = openai('gpt-4o-mini')

    const { object } = await generateObject({
        model: model,
        schema: z.object({
            story: z.string(),
            choices: z.array(z.string()),
        }),
        messages: messages,
    });
    return object;
}