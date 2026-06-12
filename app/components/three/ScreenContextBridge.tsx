'use client'

import React from 'react'
import { I18nCompat, type I18nCompatContext } from '../../i18n/TranslationProvider'
import {
  ProjectImagesContext,
  type ProjectImagesManifest,
} from '../../lib/project-images-context'
import {
  DeviceDetectionContext,
  type DeviceDetectionContextValue,
} from '../../lib/device-detection-context'

export type BridgedContexts = {
  i18n: I18nCompatContext
  manifest: ProjectImagesManifest
  device: DeviceDetectionContextValue
}

/**
 * drei `<Html>` renders its DOM children into a portal spawned from inside the
 * R3F reconciler root, so they lose every React context provided above the
 * `<Canvas>`. This component re-provides the live context values (captured in
 * `Shell3D`, which sits under the real providers) so the section components
 * rendered on the 3D screens keep working exactly as in the 2D shell —
 * `useI18n`, `useProjectImagesManifest`, `useDeviceDetectionContext`.
 *
 * Values are passed as props (not read via hooks) because the hooks would throw
 * here: this subtree is mounted inside the portal, below the provider gap.
 * Theme needs no bridging — it keys off the document-root `dark` class, which
 * the portal inherits from `<html>`.
 */
export default function ScreenContextBridge({
  values,
  children,
}: {
  values: BridgedContexts
  children: React.ReactNode
}) {
  return (
    <I18nCompat.Provider value={values.i18n}>
      <ProjectImagesContext.Provider value={values.manifest}>
        <DeviceDetectionContext.Provider value={values.device}>
          {children}
        </DeviceDetectionContext.Provider>
      </ProjectImagesContext.Provider>
    </I18nCompat.Provider>
  )
}
