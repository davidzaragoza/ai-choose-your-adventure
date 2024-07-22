export enum ErrorCodes {
  NotAuthenticated = 401,
}

export interface StoryDescription {
    id: string;
    title: string;
    genre: string;    
}

export interface StoryProperties {
  title: string;
  initalStory: string;
  initialChoices: string[];
  genre: string;
}

export interface ErrorResponse {
  code: number;
  message: string;
}
