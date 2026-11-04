import { redirect } from "next/navigation";

// The scroll-scrub intro now lives at the top of the EPK itself.
export default function SaranshIntro() {
  redirect("/epk");
}
