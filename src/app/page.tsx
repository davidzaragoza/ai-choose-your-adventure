"use client"
import { StoryComponent } from "@/components/story-component";
import { use, useEffect, useState } from "react";
import { StoryProperties } from "./models/models";
import { CreateStoryFormComponent } from "@/components/create-story-form-component";
import { SignOut } from "@/components/sign-out-component";
import { getSessionAuth } from "./actions";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";

export default function Home() {

  const router = useRouter()

  const [storyProperties, setStoryProperties] = useState<StoryProperties>();
  const [theme, setTheme] = useState("light")
  const [textSize, setTextSize] = useState("text-base")
  const [userSession, setUserSession] = useState<Session | null>(null)

  function changeTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  function handleCreateStory(properties: StoryProperties) {
    setStoryProperties(properties);
  }

  async function getSession() {
    const session = await getSessionAuth()
    if (!session) {
      router.replace("/login")
    }
    setUserSession(session)
    console.log(session);
  }

  useEffect(() => {
    getSession();
  }, []);

  const baseClassName = theme + " " + textSize;

  if (userSession === null) { 
    return <div>Loading...</div>
  }

  return (
    <div className={baseClassName}>
      <div className="flex justify-center items-center h-screen">
        {!storyProperties && <CreateStoryFormComponent callback={handleCreateStory} />}
        {storyProperties && <StoryComponent properties={storyProperties} changeTheme={changeTheme} changeTextSize={setTextSize}/>}
      </div>
      <SignOut />
    </div>
  );
}
