"use client";

import { addStoryLike, removeStoryLike } from "@/app/actions";
import { PublicStoryDescription } from "@/app/models/models";
import { ThumbsUpIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
const isoCountriesLanguages = require("iso-countries-languages");

interface Props {
  story: PublicStoryDescription;
  dict: any;
  lang: string;
}

export default function PublicStoryCardComponent({ story, dict, lang }: Props) {
  const [storyLiked, setStoryLiked] = useState(story.userLiked);
  const [storyLikes, setStoryLikes] = useState(story.likes);

  async function onLikeStory(id: string) {
    if (storyLiked) {
      await removeStoryLike(id);
      setStoryLikes(storyLikes - 1);
    } else {
      await addStoryLike(id);
      setStoryLikes(storyLikes + 1);
    }
    setStoryLiked(!storyLiked);
  }

  return (
    <Link key={story.id} href={`${lang}/story/${story.id}`}>
      <Card key={story.id} className={"bg-card"}>
        <CardHeader>
          <CardTitle>{story.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {dict[`story.genre`]}: {dict[`story.genre.${story.genre}`]}
          </div>
          <div className="text-sm text-muted-foreground">
            {dict[`story.lang`]}:{" "}
            {isoCountriesLanguages.getLanguage(lang, story.lang)}
          </div>
          <div className="text-sm text-muted-foreground">
            {story.status === "IN_PROGRESS"
              ? dict["home.card.updated"]
              : dict["story.status.finished"]}
            : {story.lastUpdated.toUTCString()}
          </div>
        </CardContent>
        <CardFooter>
          <div className="grid grid-cols-1 w-full">
            <div className="flex justify-end items-center w-full">
              <label>{storyLikes}</label>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  onLikeStory(story.id);
                }}
              >
                <ThumbsUpIcon
                  className="w-5 h-5"
                  color={storyLiked ? "blue" : "black"}
                />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
