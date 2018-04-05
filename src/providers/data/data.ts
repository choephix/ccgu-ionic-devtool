import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { CardModel, PDCharacterData, CardData } from '../../app/models';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

@Injectable()
export class DataProvider
{
  private readonly BASE_URL:string = "https://gist.githubusercontent.com/choephix/4c390b3e5502811d196233104c89f755/raw/";

  public characters:PDCharacterData[] = [];
  public cards = new Map<number,CardModel>();

  public _cardDatas:CardData[] = [];

  private get cacheBustSuffix():string { return '?' + ( new Date().valueOf() % 1000000 ) }

  constructor( private http:HttpClient, public events:Events ) 
  {
    this.load();
  }

  private load():void
  {
    console.log( "loading data from github gist" );
    
    var url_cards:string = this.BASE_URL + "card-models.json" + this.cacheBustSuffix;
    this.http.get(url_cards).subscribe( data => { this.onLoaded_Cards( <object[]>data ) } );
    
    var url_cards:string = this.BASE_URL + "pdc.json" + this.cacheBustSuffix;
    this.http.get(url_cards).subscribe( data => { this.onLoaded_PDCharacters( <object[]>data ) } );
  }

  private onLoaded_Cards( data:object[] )
  {
    // this.cards = new Map<number,CardModel>();
    this.cards.clear();
    this._cardDatas.length = 0;

    for (let i = 0; i < data.length; i++)
    {
      var o:object = data[i];
      var id:number = o["ID"];
      var c:CardModel = new CardModel( id );
      c.properties.slug = o["Slug"];
      c.properties.name = o["Name"];
      c.properties.type = o["Type"];
      c.properties.power = o["Power"];
      c.properties.description = o["Description"];
      c.properties.status = o["Status"];
      c.properties.priority = o["Priority"];
      c.properties.rarity = o["Rarity"];
      this.cards[ id ] = c;
      this._cardDatas.push( c.properties );
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
    console.log( JSON.stringify( this._cardDatas ) );
  }
}