export interface ChildDirModel {
  nowPath: string;
  dir: string[];
  file: {
    fileName: string;
    fileType: string;
    ctime: Date;
    mtime: Date;
  }[];
  overall: {
    type: string,
    count: number
  }[]
  name: string
}

export interface ParentDirModel {
  name: string;
  path: string;
  subDir: string[];
}

// https://typescript-kr.github.io/pages/Classes.html