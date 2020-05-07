import path from 'path'

const filePathRegExpString = (filePath: string): string => {
  if (path.sep === '/') {
    return filePath.replace(/([^ㄱ-ㅎㅏ-ㅣ가-힣\w\s])/g, '\\$1')
  } else {
    return filePath.replace(/\\/g, '\\\\').replace(/([^ㄱ-ㅎㅏ-ㅣ가-힣\w\s\\])/g, '\\$1')
  }
}

const filePathUrl = (filePath: string): string => {
  return filePath.replace(/\\/g, '/').replace('#', '%23').replace(/\s/g, '%20')
}

const numbericSortArray = (fileNameList: string[]): string[] => {
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base'
  })
  return fileNameList.sort(collator.compare)
}

export {
  filePathRegExpString,
  filePathUrl,
  numbericSortArray
}
