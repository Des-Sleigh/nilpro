import { redirect } from "next/navigation";

/** Bare /parent — bounces to /parent/approve so the code-entry form
 *  is what the parent sees when they type the URL from the email. */
export default function ParentRoot() {
  redirect("/parent/approve");
}
