import { ErrorCodes, ErrorResponse } from "@/app/models/models";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function isErrorResponse(obj: any): obj is ErrorResponse {
  return obj && typeof obj.message === "string" && typeof obj.code === "number";
}

function getErrorCode(object: any): ErrorCodes | null {
  if (isErrorResponse(object)) {
    return object.code;
  }
  return null;
}

export function responseHaveError(
  object: any,
  setAuthError: (value: boolean) => void
): boolean {
  const err = getErrorCode(object);
  if (err) {
    console.error("Error getting response", err);
    if (err === ErrorCodes.NotAuthenticated) {
      setAuthError(true);
    }
    return true;
  }
  return false;
}

export function getStoryGenres(): string[] {
  return ["fiction", "non-fiction", "fantasy", "mystery", "romance", "sci-fi"];
}

export function isBlank(str: string | null | undefined): boolean {
  return !str || /^\s*$/.test(str);
}