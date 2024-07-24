import { getDictionary } from "@/app/dictionaries/dictionaries";
import { SignInComponent } from "@/components/sign-in-component";

type Props = {
  params: { [lang: string]: string };
};

export default async function Login({ params: { lang } }: Props) {
  const dict = await getDictionary(lang);

  return (
    <SignInComponent dict={dict}/>
  )
}