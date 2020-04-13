export class FolderListModel {
  name: string;
  path: string;
  isLoading: boolean;
  constructor() {
    this.name = ''
    this.path = ''
    this.isLoading = false
  }
}
