"use client";

import React from 'react'
import { DeviceDetectionProvider } from '../lib/device-detection-context'
import { ProjectImagesProvider, type ProjectImagesManifest } from '../lib/project-images-context'
import ShellGate from '../components/three/ShellGate'

/**
 * App root. Mounts the shared providers, then hands off to {@link ShellGate},
 * which picks the immersive 3D shell or the classic 2D shell per device
 * capability. Both shells live under the same providers so context flows
 * identically (and can be bridged into the 3D scene's <Html> screens).
 */
export default function HomeClient({
  greeting,
  projectImagesManifest,
}: {
  greeting: string
  projectImagesManifest: ProjectImagesManifest
}) {
  return (
    <DeviceDetectionProvider>
      <ProjectImagesProvider manifest={projectImagesManifest}>
        <ShellGate greeting={greeting} />
      </ProjectImagesProvider>
    </DeviceDetectionProvider>
  )
}
