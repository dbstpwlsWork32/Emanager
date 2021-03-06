import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import { spawn } from 'child_process'
import { remote } from 'electron'
import { ffmpegBin, ffprobeBin } from '@/binaries'

interface File {
  fileName: string;
  fileType: string;
  ctime: Date;
  mtime: Date;
}
interface VideoPrefix {
  thumbnail: string;
}

class ThumbnailManager {
  readonly tableId: string;
  readonly baseDir: string;
  readonly fromPath: string;
  readonly prefix: {
    dirThumbnail: string;
    video: VideoPrefix;
  }

  constructor ({ tableId, docId, nowPath }: { tableId: string; docId: string; nowPath: string }) {
    this.tableId = tableId
    this.baseDir = ThumbnailManager.getBasePath(tableId, docId)
    this.fromPath = nowPath
    this.prefix = {
      dirThumbnail: '__dirthumbnail__',
      video: {
        thumbnail: '__vthumbnail__'
      }
    }
  }

  static getBasePath (tableId: string, docId: string): string {
    return path.join(remote.app.getPath('appData'), 'emanager_doc', tableId, docId)
  }

  async getFFmpegVideoThmOpt (scale: string, input: string, output: string): Promise<string[]> {
    const duration: number = await new Promise(resolve => {
      let durationData: number

      const ffprobe = spawn(ffprobeBin, [
        '-i', input,
        '-show_entries', 'format=duration',
        '-v', 'quiet'
      ])
      ffprobe.stdout.on('data', data => {
        durationData = parseInt(data.toString().replace(/\[\/?FORMAT\]|\s|\n/g, '').split('=').slice(-1)[0])
      })
      ffprobe.on('exit', () => {
        resolve(durationData)
      })
      ffprobe.stderr.on('data', data => {
        throw new Error(`ffprobe error ${data.toString()}`)
      })
    })

    const ffmpegArgs = [
      '-ss',
      `${Math.round(duration / 2)}`,
      '-i',
      input,
      '-vf',
      scale,
      '-vframes',
      '1',
      '-y',
      output
    ]

    return ffmpegArgs
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

    let videoConvert = false
    let ffmpegArgs: string[]
    if (representFile.fileType === 'video') {
      videoConvert = true
      ffmpegArgs = await this.getFFmpegVideoThmOpt('scale=200:-1', path.join(this.fromPath, representFile.fileName), path.join(this.baseDir, `${this.prefix.dirThumbnail}${path.parse(representFile.fileName).name}.jpg`))
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
        if (videoConvert) {
          setTimeout(() => {
            resolve()
          }, 320)
        } else {
          resolve()
        }
      })
    })

    return path.join(this.baseDir, `${this.prefix.dirThumbnail}${path.parse(representFile.fileName).name}.jpg`)
  }
}

class VideoThumnail extends ThumbnailManager {
  fileBase: string;

  constructor ({ nowPath, docId, tableId, fileBase }: { nowPath: string; docId: string; tableId: string; fileBase: string }) {
    super({ tableId, docId, nowPath })
    this.fileBase = fileBase
  }

  async getThumbnail (): Promise<string> {
    const inputFileName = path.parse(this.fileBase).name
    const outputFolder = path.join(this.baseDir, inputFileName)
    // check exist folder
    try {
      await fs.promises.stat(outputFolder)
    } catch {
      await mkdirp(outputFolder)
    }

    const outputFile = path.join(outputFolder, `${this.prefix.video.thumbnail}.jpg`)
    // check exist file
    try {
      await fs.promises.stat(outputFile)
    } catch {
      // if not exist, make thumbnail
      const ffmpegArgs = await this.getFFmpegVideoThmOpt('scale=320:-1', path.join(this.fromPath, this.fileBase), outputFile)

      await new Promise(resolve => {
        const ffmpeg = spawn(ffmpegBin, ffmpegArgs)

        ffmpeg.on('error', () => {
          throw new Error(`make thmbnail error\n ${ffmpegArgs}\n${outputFile}\n${this.fromPath}`)
        })
        ffmpeg.on('exit', () => {
          setTimeout(() => {
            resolve()
          }, 320)
        })
      })
    }

    return outputFile
  }
}

export {
  ThumbnailDir,
  ThumbnailManager,
  VideoThumnail
}
