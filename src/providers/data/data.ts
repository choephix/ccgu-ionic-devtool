import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events, ToastController } from 'ionic-angular';
import { CardModel, PDCharacterData, CardData, CardType } from '../../app/models';
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

  private tracker:DataTracker = new DataTracker();

  private get cacheBustSuffix():string { return '?' + ( new Date().valueOf() % 1000000 ) }

  constructor( private http:HttpClient, public events:Events, private toast:ToastController ) 
  {
    this.load();

    setInterval( () => this.checkForChanges(), 1000 );
    // setInterval( () => this.checkForChanges(), 5000 );
  }

  public anyChanges():boolean { return this.tracker.cardDatasChanged }

  private checkForChanges():void
  {
    this.tracker.cardDatasChanged = 
      this.tracker.cardDatasJson != JSON.stringify( this.cardDatas );
  }
  
  public createCard( id:number ):CardModel
  {
    let card:CardModel = CardModel.makeClean( id );
    card.properties.power = 0;
    card.properties.priority = 0;
    card.properties.rarity = 0;
    card.properties.status = 0;
    card.properties.type = CardType.Unit;
    card.properties.slug = "";
    card.properties.name = "";
    card.properties.description = "";

    this.cards[id] = card;
    this.cardDatas.push( card.properties );
    this.tracker.cardDatasChanged = true;

    return card;
  }

  public deleteCard( id:number ):void
  {
    delete this.cards[ id ];
    
    for ( let i = this.cardDatas.length - 1; i >= 0; i--)
      if ( this.cardDatas[i].id == id )
        this.cardDatas.splice( i, 1 );

    this.tracker.cardDatasChanged = true;
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

    this.tracker.cardDatasJson = JSON.stringify( this.cardDatas );
    this.tracker.cardDatasChanged = false;

    this.events.publish( "data:reload" );
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
    const url:string = this.URL_POST;
    const headers = new HttpHeaders().set( "Authorization", "token 92f64861cfd1d719939c0f16b617b77f849e13fd " );
    const data = {
      description: "ccgu devtool data",
      files: { "card-models.json": { content: JSON.stringify( this.cardDatas ) } }
    };

    this.tracker.cardDatasChanged = false;
    this.http.post(url,data,{headers:headers})
      .subscribe( data => {
        console.log( data );
        this.showToast( "Data Saved" );
        this.tracker.cardDatasJson = JSON.stringify( this.cardDatas );
        this.tracker.cardDatasChanged = false;
      } );
  }

  private showToast( msg:string ):void
  {
    this.toast.create( { message:msg, duration : 1500 } ).present();
  }

  // private showToastError( msg:string ):void
  // {
  //   this.toast.create( { message:msg, showCloseButton : true } ).present();
  // }
}

class DataTracker
{
  public cardDatasJson:string = "";
  public cardDatasChanged:boolean = false;
}