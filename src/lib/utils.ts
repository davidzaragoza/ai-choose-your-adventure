import { getSessionAuth } from "@/app/actions";
import { ErrorCodes, ErrorResponse } from "@/app/models/models";
import { type ClassValue, clsx } from "clsx";
import { Session } from "next-auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function isErrorResponse(obj: any): obj is ErrorResponse {
  return obj && typeof obj.message === "string" && typeof obj.code === "number";
}

export function checkError(router: AppRouterInstance, object: any) {
  if (isErrorResponse(object)) {
    console.error("Response error:", object.message);
    if (object.code === ErrorCodes.NotAuthenticated) {
      router.replace("/login");
    }
  }
}
