"use client";

import { DeviceDetectionProvider } from '../lib/device-detection-context'
import { ProjectImagesProvider, type ProjectImagesManifest } from '../lib/project-images-context'
import SystemeHome from '../components/systeme/SystemeHome'

/**
 * Systeme art direction — dark editorial / kinetic-blueprint redesign.
 * Providers (device detection, project images, and i18n via the locale layout)
 * wrap the self-contained Systeme composition.
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
        <SystemeHome />
      </ProjectImagesProvider>
    </DeviceDetectionProvider>
  )
}
