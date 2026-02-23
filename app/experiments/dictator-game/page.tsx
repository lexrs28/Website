import { permanentRedirect } from "next/navigation";

export default function DictatorGameRedirectPage() {
  permanentRedirect("/experiments/temporal-discounting");
}
