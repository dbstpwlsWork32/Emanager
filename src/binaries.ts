'use strict'
import path from 'path'
import { remote } from 'electron'
import { platform } from 'os'

let nowPlatfrom = ''
switch (platform()) {
  case 'aix':
  case 'freebsd':
  case 'linux':
  case 'openbsd':
  case 'android':
    nowPlatfrom = 'linux'
    break
  case 'darwin':
  case 'sunos':
    nowPlatfrom = 'mac'
    break
  case 'win32':
    nowPlatfrom = 'win'
    break
}

const IS_PROD = process.env.NODE_ENV === 'production'
const root = process.cwd()
const { isPackaged, getAppPath } = remote.app

const binariesPath =
  IS_PROD && isPackaged
    ? path.join(path.dirname(getAppPath()), '..', './Resources', './bin')
    : path.join(root, './resources', nowPlatfrom, './bin')

export const ffmpegBin = path.resolve(path.join(binariesPath, './ffmpeg.exe'))
export const ffprobeBin = path.resolve(path.join(binariesPath, './ffprobe.exe'))
