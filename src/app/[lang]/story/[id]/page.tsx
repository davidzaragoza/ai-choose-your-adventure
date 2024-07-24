"use client"

import { getDictionary } from "@/app/dictionaries/dictionaries";
import { StoryComponent } from "@/components/story-component";
import { useParams } from "next/navigation";

export default function Story() {
  const params = useParams<{ id: string, lang: string }>();
  const dict = getDictionary(params.lang);

  return <StoryComponent id={params.id} dict={dict}/>;
}
