export interface Bookmark {
  id: string;
  url: string;
  title: string;
  tags: string[];
  createdAt: string;
}

export interface BookmarkStore {
  version: number;
  bookmarks: Bookmark[];
}
