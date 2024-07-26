import { getDictionary } from "@/app/dictionaries/dictionaries";
import { StoryComponent } from "@/components/story-component";

type Props = {
  params: { [lang: string]: string, id: string };
};

export default async function Story({ params: { lang, id } }: Props) {
  const dict = await getDictionary(lang);

  return <StoryComponent id={id} dict={dict} lang={lang}/>;
}
