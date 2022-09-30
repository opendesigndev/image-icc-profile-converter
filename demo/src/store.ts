import { createStoreon, StoreonModule } from 'storeon'
import { ParsedFile } from '../../src'

// State structure
export interface State {
  file?: File
  parsed?: ParsedFile
  error?: Error
}

// Events declaration: map of event names to type of event data
export interface Events {
  home: void
  fileUploaded: File
  fileParsed: ParsedFile
  errorOccured: Error
  errorAcked: void
}


const updates: StoreonModule<State, Events> = store => {
  store.on('@init', () => ({}))
  store.on('home', () => ({ file: undefined, parsed: undefined }))
  store.on('fileUploaded', (_state, file) => ({ file }))
  store.on('fileParsed', (_state, parsed) => ({ parsed }))
  store.on('errorOccured', (_state, error) => ({ error }))
  store.on('errorAcked', (_state) => ({ error: undefined }))
}

export const store = createStoreon([updates])
