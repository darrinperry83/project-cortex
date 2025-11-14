import RefileDemo from "@/components/_vision/RefileDemo";
import OutlineDemo from "@/components/_vision/OutlineDemo";
import { initPathHelpers } from "@/lib/path";

export default function Page() {
  initPathHelpers();
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-2">Select a node (Outline)</h3>
        <OutlineDemo />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Refile</h3>
        <RefileDemo />
      </div>
    </div>
  );
}
