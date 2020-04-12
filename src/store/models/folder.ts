interface FileResult {
  fileName: string;
  fileType: string;
  ctime: Date;
  mtime: Date;
}
interface OneDirReadResultAll {
  nowPath: string;
  dir: OneDirReadResultAll[];
  file: FileResult[];
}

export class FolderModel {
  constructor(
    folderUrl: string,
    data: OneDirReadResultAll[] = []
  ) {
    this.folderUrl = folderUrl
    this.data = data
  }

  folderUrl: string
  data: OneDirReadResultAll[] = []
}

export class FolderListModel {
  name: string;
  path: string;
  constructor() {
    this.name = ''
    this.path = ''
  }
}