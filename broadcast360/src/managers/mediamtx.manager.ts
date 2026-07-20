export class MediaMTXManager {


  async getPath(path:string){

    const res = await fetch(
      `http://localhost:9997/v3/paths/get/${path}`
    );


    if(!res.ok){
      return null;
    }


    return res.json();

  }



  async isOnline(path:string){

    const data =
      await this.getPath(path);


    return !!data;

  }


}