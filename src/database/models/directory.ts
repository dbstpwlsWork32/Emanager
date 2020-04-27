export interface DirDocumentModel {
  nowPath: string;
  overall: {
    type: string,
    count: number
  }[];
  dir: string[];
  file: {
    fileName: string;
    fileType: string;
    ctime: Date;
    mtime: Date;
  }[];
  user?: any
  isRoot?: boolean
}

export interface RootTableModel {
  nowPath: string;
  name: string;
}

export interface NEDBRootTable extends RootTableModel {
  _id: string
}

export interface NEDBDirDocument extends DirDocumentModel {
  _id: string
}

// https://typescript-kr.github.io/pages/Classes.html