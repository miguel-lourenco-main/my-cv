"use client";

import { DeviceDetectionProvider } from '../lib/device-detection-context'
import { ProjectImagesProvider, type ProjectImagesManifest } from '../lib/project-images-context'
import BrutalistHome from '../components/brutalist/BrutalistHome'

/**
 * Brutalist art direction — terminal / tech redesign (monospace, hard borders).
 */
export default function HomeClient({
  projectImagesManifest,
}: {
  greeting: string
  projectImagesManifest: ProjectImagesManifest
}) {
  return (
    <DeviceDetectionProvider>
      <ProjectImagesProvider manifest={projectImagesManifest}>
        <BrutalistHome />
      </ProjectImagesProvider>
    </DeviceDetectionProvider>
  )
}
