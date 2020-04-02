interface file {
  import: Date
}

import { getAppDataPath } from './getAppDataFolder'
import Datastore from 'nedb'

let db = {
  file: new Datastore({ filename: getAppDataPath('test.db'), autoload: true })
}

db.file.loadDatabase()

// https://lts0606.tistory.com/263  