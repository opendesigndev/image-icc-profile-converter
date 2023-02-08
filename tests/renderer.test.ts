import {beforeAll, describe, expect, it} from 'vitest'
import path from 'path'

import {getRenderer} from '../src/index'
import {promises as fsp} from 'fs'

const FIXTURE_DIR = path.join(__dirname, 'fixtures')

function getFixture(fileName: string) {
  return fsp.readFile(path.resolve(FIXTURE_DIR, fileName))
}

describe('renderer', () => {
  let renderer

  beforeAll(async () => {
    renderer = await getRenderer()
  })

  it('returns profile name', async () => {
    const icc_profile = await getFixture('SWOP_ICC_PROFILE')

    const icc_name = renderer.iccProfileName(new Uint8Array(icc_profile))
    expect(icc_name).toBe('U.S. Web Coated (SWOP) v2')
  })
})
