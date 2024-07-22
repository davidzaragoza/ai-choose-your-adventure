"use client"

import { StoryComponent } from "@/components/story-component";
import { useParams } from "next/navigation";

export default function Story() {
  const params = useParams<{ id: string }>();

  return <StoryComponent id={params.id} />;
}
