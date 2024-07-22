import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

export function SignOutComponent() {
  return (
    <>
      <Button
        variant="ghost"
        className="rounded-full"
        onClick={() => signOut({ redirect: true })}
      >
        <span>Logout</span>
      </Button>
    </>
  );
}
