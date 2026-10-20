// Remove the per-segment recording clips (public/projects_videos/<id>/clips/)
// from the static export: `next build` copies all of public/ into out/, and the
// clips are compositor inputs only (git-ignored, tens of MB). Runs after build.
const fs = require("node:fs");
const path = require("node:path");

const dir = path.join(process.cwd(), "out", "projects_videos");
if (fs.existsSync(dir)) {
  for (const id of fs.readdirSync(dir)) {
    const clips = path.join(dir, id, "clips");
    if (fs.existsSync(clips)) {
      fs.rmSync(clips, { recursive: true, force: true });
      console.log(`[strip-video-clips] removed out/projects_videos/${id}/clips`);
    }
  }
}
