export enum ErrorCodes {
  NotAuthenticated = 0,
  AlreadyLiked = 1,
  StoryNotLiked = 2,
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
