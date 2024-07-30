export enum ErrorCodes {
  NotAuthenticated = 1,
  AlreadyLiked = 2,
  StoryNotLiked = 3,
}

export interface StoryDescription {
  id: string;
  title: string;
  genre: string;
  lang: string;
  lastUpdated: Date;
  status: string;
  public: boolean;
  likes: number;
}

export interface PublicStoryDescription {
  id: string;
  title: string;
  genre: string;
  lang: string;
  lastUpdated: Date;
  status: string;
  public: boolean;
  likes: number;
  userLiked: boolean;
}

export interface Story {
  id: string;
  title: string;
  genre: string;
  lang: string;
  story: string[];
  choices: string[];
  status: string;
  public: boolean;
  likes: number;
}

export interface NextStoryPart {
  story: string;
  choices: string[];
}

export interface ErrorResponse {
  code: number;
  message: string;
}

export interface PublicStoryFilter {
  genre: string | null;
  lang: string | null;
}