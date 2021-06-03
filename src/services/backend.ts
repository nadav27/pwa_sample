import { Video } from '../models/Video';

export class Backend {
  async isOnline() {
    //todo: ping API to check connectivity?
    return false;//navigator.onLine;
  }

  private videos: Video[] = [{
    name: 'TestVideo1',
    _id: "1",
    isSeen: false,
    url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
    _attachments: null
  }];

  public getVideos(): Promise<Video[]> {
    return Promise.resolve(this.videos);
  }
}
