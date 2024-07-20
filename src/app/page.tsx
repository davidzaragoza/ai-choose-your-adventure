"use client"
import { StoryComponent } from "@/components/story-component";
import { useState } from "react";
import { StoryProperties } from "./models/models";
import { CreateStoryFormComponent } from "@/components/create-story-form-component";

export default function Home() {

  const [storyProperties, setStoryProperties] = useState<StoryProperties>();

  function handleCreateStory(properties: StoryProperties) {
    setStoryProperties(properties);
  }


  return (
    <div className="flex justify-center items-center h-screen">
      {!storyProperties && <CreateStoryFormComponent callback={handleCreateStory} />}
      {storyProperties && <StoryComponent properties={storyProperties} />}
    </div>
  );
}
