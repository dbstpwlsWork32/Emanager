export interface DirBaseModel {
  nowPath: string;
  overall: {
    type: string,
    count: number
  }[];
}

export interface ParentDirModel extends DirBaseModel {
  name: string;
  process?: string;
}

export interface ChildDirModel extends DirBaseModel {
  dir: string[];
  file: {
    fileName: string;
    fileType: string;
    ctime: Date;
    mtime: Date;
  }[];
}

// https://typescript-kr.github.io/pages/Classes.html