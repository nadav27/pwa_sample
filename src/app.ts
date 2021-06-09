import { Video } from './models/Video';
import { Backend } from 'services/backend';
import { autoinject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import videojs from 'video.js';

import PouchDB from 'pouchdb';


@autoinject()
export class App {
  public message = 'Loading...';
  dbContents: any;
  videos: Video[];
  db: PouchDB.Database<any>;
  vidUrl: string;
  online: boolean;


  constructor(private backend: Backend, private httpClient: HttpClient) {
  }

   createObjUrl(videoData){
    const URL = window.URL || window.webkitURL;

    const blob = this.b64toBlob(videoData);

    return URL.createObjectURL(blob);
  }

  async activate() {
    this.db = new PouchDB('videos');
    this.dbContents = await this.db.allDocs({
      include_docs: true,
      attachments: true
    });

    console.log(this.dbContents)

    this.online = await this.backend.isOnline();
    if (this.online) {
      this.message = "Network available!";
      this.videos = await this.backend.getVideos();
    }
    else {
      this.message = `You seem to be offline... You have ${this.dbContents.rows.length} video(s) downloaded.`;
      this.videos = this.dbContents.rows.map(r => ({ ...r.doc, url: this.createObjUrl(r.doc._attachments['video.mp4'].data)}));
    }    
  }

  async attached() {
    navigator.serviceWorker.register('/sw.js');
  }

  async saveAndUploadVideo(video) {
    console.log(video);
    const exists = async (id) => {
      return await this.db.get(id)
        .then(() => Promise.resolve(true))
        .catch(() => Promise.resolve(false));
    }

    if (await exists(video._id)) {
      return;
    }

    console.log("Downloading video...")
    const videoRow = {
      "_id": video._id,
      "title": video.name,
      "_attachments": {
        "video.mp4": {
          "content_type": "video/mp4",
          "data": await this.downloadVideo(`https://whispering-plateau-87756.herokuapp.com/${video.url}`)
        }
      }
    }
    await this.db.put(videoRow);
    console.log("Downloading complete.")
  }

  async downloadVideo(url) {
    return await this.httpClient.fetch(url)
      .then((data) => data.blob());
  }

  b64toBlob = (b64Data, contentType = 'video/mp4', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
}
