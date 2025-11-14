import CaptureDemo from "@/components/_vision/CaptureDemo";
import { initPathHelpers } from "@/lib/path";

export default function Page() {
  initPathHelpers();
  return <CaptureDemo />;
}
