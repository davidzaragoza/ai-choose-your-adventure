"use client";

import { StoryDescription } from "@/app/models/models";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Trash2Icon } from "lucide-react";
const isoCountriesLanguages = require("iso-countries-languages");

interface Props {
  story: StoryDescription;
  dict: any;
  lang: string;
  callbackUpdateStory(id: string, isPublic: boolean): void;
  callbackRemoveStory(id: string): void;
}

export default function StoryCardComponent({
  story,
  dict,
  lang,
  callbackUpdateStory,
  callbackRemoveStory,
}: Props) {
  return (
    <Link key={story.id} href={`${lang}/story/${story.id}`}>
      <Card
        key={story.id}
        className={story.status === "IN_PROGRESS" ? "bg-card" : "bg-secondary"}
      >
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
          <div className="grid grid-cols-2 w-full">
            <div className="flex w-full">
              {story.status === "FINISHED" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published-mode"
                    checked={story.public}
                    onClick={(e) => {
                      e.preventDefault();
                      callbackUpdateStory(story.id, !story.public);
                    }}
                  />
                  <Label htmlFor="published-mode">
                    {dict["home.story.published"]}
                  </Label>
                </div>
              )}
            </div>
            <div className="flex justify-end w-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  callbackRemoveStory(story.id);
                }}
              >
                <Trash2Icon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
