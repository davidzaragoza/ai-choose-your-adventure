export enum ErrorCodes {
  NotAuthenticated = 401,
}

export interface StoryDescription {
  id: string;
  title: string;
  genre: string;
  lastUpdated: Date;
}

export interface Story {
  id: string;
  title: string;
  genre: string;
  story: string[];
  choices: string[];
}

export interface NextStoryPart {
  story: string;
  choices: string[];
}

export interface ErrorResponse {
  code: number;
  message: string;
}
