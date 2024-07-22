"use client";
import { HomeComponent } from "@/components/home-component";
import { LoadingComponent } from "@/components/loading-component";
import { responseHaveError } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStories } from "./actions";
import { StoryDescription } from "./models/models";

export default function Home() {
  const router = useRouter();

  const [authError, setAuthError] = useState(false);
  const [stories, setStories] = useState<StoryDescription[]>();

  async function init() {
    const stories = await getStories();
    if (responseHaveError(stories, setAuthError)) {
      return;
    }
    setStories(stories as StoryDescription[]);
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (authError) {
      console.error("Redirecting to login");
      router.replace("/login");
    }
  }, [authError, router]);

  if (!stories) {
    return <LoadingComponent title="Cargando" message="Buscando historias" />;
  }

  return <HomeComponent router={router} stories={stories} />;
}
