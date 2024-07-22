"use client";
import { HomeComponent } from "@/components/home-component";
import { checkError } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStories } from "./actions";
import { StoryDescription } from "./models/models";
import { LoadingComponent } from "@/components/loading-component";

export default function Home() {
  const router = useRouter();

  const [stories, setStories] = useState<StoryDescription[]>();

  async function init() {
    const stories = await getStories();
    checkError(router, stories);
    setStories(stories as StoryDescription[]);
  }

  useEffect(() => {
    init();
  }, []);

  if (stories === null) {
    return <LoadingComponent title="Cargando" message="Buscando historias" />;
  }

  return <HomeComponent router={router} />;
}
