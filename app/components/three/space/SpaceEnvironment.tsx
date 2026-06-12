'use client'

import Starfield from './Starfield'
import Nebula from './Nebula'
import Planets from './Planets'
import SpaceTear from './SpaceTear'

/**
 * The full procedural backdrop: a sparse-front / dense-back starfield, an
 * animated nebula, scattered planets, and the tear in space behind the viewer —
 * the "woah" you find on a 180° turn.
 */
export default function SpaceEnvironment() {
  return (
    <group>
      <Starfield />
      <Nebula />
      <Planets />
      <SpaceTear />
    </group>
  )
}
