"use client"
import { signInWithGoogle } from "@/app/actions"
 
export function SignInComponent() {
  return (
    <form
      action={async () => {
        await signInWithGoogle()
      }}
    >
      <button type="submit">Signin with Google</button>
    </form>
  )
} 