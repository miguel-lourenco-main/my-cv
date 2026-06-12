"use client";

import { DeviceDetectionProvider } from '../lib/device-detection-context'
import { ProjectImagesProvider, type ProjectImagesManifest } from '../lib/project-images-context'
import OrganicHome from '../components/organic/OrganicHome'

/**
 * Organic art direction — lush WebGL shader-gradient + glassmorphism redesign.
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
        <OrganicHome />
      </ProjectImagesProvider>
    </DeviceDetectionProvider>
  )
}
