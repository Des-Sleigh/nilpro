import { redirect } from "next/navigation";

export default function SignupRoot() {
  redirect("/signup/create");
}
