export interface Video {
  readonly name: string;
  readonly _id: string;
  isSeen: boolean;
  url: string;
  _attachments: any;
}
