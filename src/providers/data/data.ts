import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events, ToastController } from 'ionic-angular';
import { CardModel, PDCharacterData, CardData } from '../../app/models';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

@Injectable()
export class DataProvider
{
  private readonly URL_FILE:string = "https://gist.githubusercontent.com/choephix/4c390b3e5502811d196233104c89f755/raw/";
  private readonly URL_POST:string = "https://api.github.com/gists/4c390b3e5502811d196233104c89f755";
  
  public characters:PDCharacterData[] = [];
  public cards = new Map<number,CardModel>();

  public cardDatas:CardData[] = [];

  private get cacheBustSuffix():string { return '?' + ( new Date().valueOf() % 1000000 ) }

  constructor( private http:HttpClient, public events:Events, private toast:ToastController ) 
  {
    this.load();
  }

  private load():void
  {
    console.log( "loading data from github gist" );
    
    var url_cards:string = this.URL_FILE + "card-models.json" + this.cacheBustSuffix;
    this.http.get(url_cards).subscribe( data => { this.onLoaded_Cards( <object[]>data ) } );
    
    var url_pdc:string = this.URL_FILE + "pdc.json" + this.cacheBustSuffix;
    this.http.get(url_pdc).subscribe( data => { this.onLoaded_PDCharacters( <object[]>data ) } );
  }

  private onLoaded_Cards( data:object[] )
  {
    this.cards.clear();
    this.cardDatas.length = 0;

    for (let i = 0; i < data.length; i++)
    {
      var c:CardData = <CardData>data[i];
      var id:number = c.id;
      this.cards[ id ] = CardModel.makeFromData(c);
      this.cardDatas.push( c );
    }

    this.events.publish( "data:change" );
    // this.showToast( "Data Loaded" );
  }
  
  private onLoaded_PDCharacters( data:object[] )
  {
    this.characters.length = 0;
    this.characters = <PDCharacterData[]>data;
    this.characters.sort( (a,b) => a.origin < b.origin ? -1 : 1 );

    this.events.publish( "data:change" );
  }

  public save():void
  {
    console.log( JSON.stringify( this.cardDatas ) );

    const url:string = this.URL_POST;
    const headers = new HttpHeaders().set( "Authorization", "token 92f64861cfd1d719939c0f16b617b77f849e13fd " );
    const data = {
      description: "ccgu devtool data",
      files: {
        "card-models.json": {
          content: JSON.stringify( this.cardDatas ) 
        },
      }
    };

    this.http.post(url,data,{headers:headers})
      .subscribe( data => this.showToast( "Data Saved" ) );
  }

  private showToast( msg:string ):void
  {
    this.toast.create( { message:msg, duration : 1500, showCloseButton : true } ).present();
  }
}