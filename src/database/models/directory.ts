export interface DirBaseModel {
  nowPath: string;
  overall: {
    type: string,
    count: number
  }[];
}

export interface ParentDirModel extends DirBaseModel {
  name: string;
}

export interface ChildDirModel extends DirBaseModel {
  dir: string[];
  file: {
    fileName: string;
    fileType: string;
    ctime: Date;
    mtime: Date;
  }[];
  rate: number;
}

// https://typescript-kr.github.io/pages/Classes.html