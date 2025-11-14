import SlicesDemo from "@/components/_vision/SlicesDemo";
import { initPathHelpers } from "@/lib/path";
export default function Page() {
  initPathHelpers();
  return <SlicesDemo />;
}
