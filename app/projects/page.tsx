import { permanentRedirect } from "next/navigation";

export default function ProjectsRedirectPage() {
  permanentRedirect("/about");
}
