import lcms from './lcms'
import {Renderer} from './renderer'

export async function getRenderer(): Promise<Renderer> {
  const renderer = new Renderer(await lcms())

  return renderer
}

export {Renderer}
