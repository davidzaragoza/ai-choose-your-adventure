import { init } from "next/dist/compiled/webpack/webpack"

export interface StoryProperties {
    title: string
    initalStory: string
    initialChoices: string[]
    genre: string
}