import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
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

  constructor( private http:HttpClient, public events:Events ) 
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
    const headers = new HttpHeaders().set( "Authorization", "token 8cae25bee2eb5b59d118ba50454c61892da24618" );
    const data = {
      description: null,
      files: {
        "card-models.json": {
          content: JSON.stringify( this.cardDatas ) 
        },
      }
    };

    this.http.post(url,data,{headers:headers}).subscribe( console.log );
  }
}