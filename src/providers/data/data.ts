import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

@Injectable()
export class DataProvider {

  constructor(public http:HttpClient) 
  {
    console.log('Hello DataProvider Provider');
  }

  public load():void
  {
    console.log( "loading.." );

    this.http.get('https://api.github.com/users/seeschweiler').subscribe(data => {
      console.log(data);
    });
  }
}
