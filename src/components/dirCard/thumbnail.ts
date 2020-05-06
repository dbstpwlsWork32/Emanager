import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import { spawn } from 'child_process'
import { remote } from 'electron'
import { ffmpegBin } from '@/binaries'

interface File {
  fileName: string;
  fileType: string;
  ctime: Date;
  mtime: Date;
}

class ThumbnailManager {
  readonly tableId: string;
  readonly baseDir: string;
  readonly fromPath: string;
  readonly prefix: {
    dirThumbnail: string;
  }

  constructor ({ tableId, docId, nowPath }: { tableId: string; docId: string; nowPath: string }) {
    this.tableId = tableId
    this.baseDir = ThumbnailManager.getBasePath(tableId, docId)
    this.fromPath = nowPath
    this.prefix = {
      dirThumbnail: '__dirthumbnail__'
    }
  }

  static getBasePath (tableId: string, docId: string): string {
    return path.join(remote.app.getPath('appData'), 'emanager_doc', tableId, docId)
  }
}

class ThumbnailDir extends ThumbnailManager {
  readonly file: File[]

  constructor ({ tableId, docId, nowPath, file }: { tableId: string; docId: string; nowPath: string; file: File[] }) {
    super({ tableId, docId, nowPath })
    this.file = file
  }

  async getDirThumbnail (): Promise<string | boolean> {
    let readResult = []
    try {
      readResult = await fs.promises.readdir(this.baseDir)
    } catch {
      await mkdirp(this.baseDir)
      return false
    }

    for (const file of readResult) {
      if (file.match(this.prefix.dirThumbnail)) return path.join(this.baseDir, file)
    }

    return false
  }

  // it will return thumbnail file path
  async makeDirThumbnail (): Promise<string | boolean> {
    const isExistThumbnail = await this.getDirThumbnail()

    if (typeof isExistThumbnail === 'string') {
      const thumbnailRealName = path.parse(isExistThumbnail).name.replace(this.prefix.dirThumbnail, '')
      for (const file of this.file) {
        if (path.parse(file.fileName).name === thumbnailRealName) return isExistThumbnail
      }
    }

    let representFile: boolean | File = false
    for (const file of this.file) {
      if (file.fileType === 'video' || file.fileType === 'picture') {
        representFile = file
        break
      }
    }

    if (!representFile) return false

    let ffmpegArgs: string[]
    if (representFile.fileType === 'video') {
      ffmpegArgs = [
        '-ss',
        '3',
        '-i',
        path.join(this.fromPath, representFile.fileName),
        '-vf',
        'select=gt(scene\\,0.5),scale=320:-1',
        '-frames:v',
        '1',
        '-y',
        path.join(this.baseDir, `${this.prefix.dirThumbnail}${path.parse(representFile.fileName).name}.jpg`)
      ]
    } else {
      ffmpegArgs = [
        '-i',
        path.join(this.fromPath, representFile.fileName),
        '-vf',
        'scale=100:-1',
        path.join(this.baseDir, `${this.prefix.dirThumbnail}${path.parse(representFile.fileName).name}.jpg`)
      ]
    }

    await new Promise(resolve => {
      const ffmpeg = spawn(ffmpegBin, ffmpegArgs)

      ffmpeg.on('error', () => {
        throw new Error(`make thmbnail error\n ${ffmpegArgs}\n${representFile}\n${this.fromPath}`)
      })
      ffmpeg.on('exit', () => {
        resolve()
      })
    })

    return path.join(this.baseDir, `${this.prefix.dirThumbnail}${path.parse(representFile.fileName).name}.jpg`)
  }
}

export {
  ThumbnailDir,
  ThumbnailManager
}
