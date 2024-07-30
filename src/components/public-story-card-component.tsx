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
const isoCountriesLanguages = require("iso-countries-languages");

interface Props {
  story: StoryDescription;
  dict: any;
  lang: string;
}

export default function PublicStoryCardComponent({
  story,
  dict,
  lang,
}: Props) {
  return (
    <Link key={story.id} href={`${lang}/story/${story.id}`}>
      <Card
        key={story.id}
        className={"bg-card"}
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
        </CardFooter>
      </Card>
    </Link>
  );
}
