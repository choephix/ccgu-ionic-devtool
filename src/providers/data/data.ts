import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events, ToastController } from 'ionic-angular';
import { CardModel, PDCharacterData, CardData, CardType, CardSectionData } from '../../app/models';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

@Injectable()
export class DataProvider
{
  private readonly FILE_CARDS:string = "card-models.json";
  private readonly FILE_CONFIG:string = "editor-stuff.json";
  private readonly FILE_PDC:string = "pdc.json";

  public cardsMap = new Map<number,CardModel>();
  public pdcMap = new Map<string,PDCharacterData>();

  public config:DataFile<ConfigurationData>;
  public cards:DataFile<CardData[]>;
  public pdc:DataFile<PDCharacterData[]>;

  public datafiles:IDataFile[];
  
  private saving:boolean;
  
  constructor( private http:HttpClient, public events:Events, private toast:ToastController ) 
  {
    this.config = new DataFile<ConfigurationData>( this.FILE_CONFIG, http );
    this.cards = new DataFile<CardData[]>( this.FILE_CARDS, http );
    this.pdc = new DataFile<PDCharacterData[]>( this.FILE_PDC, http );

    this.config.data = new ConfigurationData();

    this.datafiles = [ this.config, this.cards, this.pdc ];

    this.loadAll();

    setInterval( () => this.checkForChanges(), 1000 );
  }

  public isBusy():boolean { return this.saving || !this.datafiles.every( (v,i,a) => { return !v.busy } ) }
  public anyChanges():boolean { return !this.datafiles.every( (v,i,a) => { return !v.dataHasChanged } ) }
  private checkForChanges():void { this.datafiles.forEach( v => { v.checkForChanges() } ); }
  
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
    card.properties.tags = [];

    this.cardsMap[id] = card;
    this.cards.data.unshift( card.properties );
    this.cards.dataHasChanged = true;

    return card;
  }

  public createPDC( origin:string, at:number ):PDCharacterData
  {
    let pdc:PDCharacterData = {
      origin : origin,
      name : "",
      notes_character : "",
      notes_cardstats : "",
      tags : [],
      faction : "",
      guid : GUID.make()
    }
    this.pdc.data.splice(at,0,pdc);
    return pdc;
  }

  public deleteCard( id:number ):void
  {
    delete this.cardsMap[ id ];
    for ( let i = this.cards.data.length - 1; i >= 0; i--)
      if ( this.cards.data[i].id == id )
        this.cards.data.splice( i, 1 );
    this.cards.dataHasChanged = true;
  }

  public getCardSectionData(index:number):CardSectionData
  { return this.config.data.cardSections[index%this.config.data.cardSections.length] }

  public anyCardHasPDC( pdc:PDCharacterData ):boolean
  {
    if( !this.cards.data )
      return false;
    for (let i = 0; i < this.cards.data.length; i++)
      if ( this.cards.data[i].pdc == pdc.guid )
        return true;
    return false;
  }

  ///

  private loadAll():void
  {
    console.log( "loading data from github gist" );

    this.config.load( data => this.onLoaded_Configuration( data ) );
    this.cards.load( data => this.onLoaded_Cards( data ) );
    this.pdc.load( data => this.onLoaded_PDCharacters( data ) );
  }

  private onLoaded_Configuration( data:ConfigurationData )
  {
    this.events.publish( "data:reload" );
  }

  private onLoaded_Cards( data:CardData[] )
  {
    // for ( let i = data.length - 1; i >= 0; i-- )
    // {
    //   for ( let j = data.length - 1; j > i; j-- )
    //   {
    //     let a = data[i], b = data[j];
    //     if ( a.slug == b.slug && a.description == b.description )
    //     {
    //       console.log( "duplicate cards: " + a.id + " = " + b.id + " " + a.slug );
    //       this.cards.data.splice( a.id > b.id ? i : j, 1 );
    //     }
    //   }
    // }

    // for ( let i = data.length - 1; i >= 0; i-- )
    // {
    //   for ( let j = data.length - 1; j > i; j-- )
    //   {
    //     let a = data[i], b = data[j];
    //     if ( a.id == b.id )
    //     {
    //       console.log( "id collision: " + a.slug + " vs " + b.slug );
    //       a.id += 256;
    //     }
    //   }
    // }

    // this.cardsMap.clear();
    this.cardsMap = new Map<number,CardModel>();
    for ( let i = 0; i < data.length; i++ )
      this.cardsMap[ data[i].id ] = CardModel.makeFromData( data[i] );

    this.events.publish( "data:reload" );
  }
  
  private onLoaded_PDCharacters( data:PDCharacterData[] )
  {
    // data.sort( sortFunction );

    function sortFunction(aa:PDCharacterData,bb:PDCharacterData):number
    {
      let a:string = aa.origin.toUpperCase();
      let b:string = bb.origin.toUpperCase();
      return a < b ? -1 : a > b ? 1 : 0;
    }

    for ( let i = data.length - 1; i >= 0; i--)
      this.pdcMap[data[i].guid] = data[i];

    this.events.publish( "data:reload" );
  }

  public saveAll():void
  {
    let token:string = "6dae67b6" + "f3085406" + "f57a9412";
    token += "c1d8d6ef";
    token += "5d888863";
    const url:string = "https://api.github.com/gists/4c390b3e5502811d196233104c89f755";
    const headers = new HttpHeaders().set( "Authorization", "token  " + token );

    const files = {};
    this.datafiles.forEach( datafile => {
      if ( datafile.dataHasChanged )
        files[datafile.filename] = { content : JSON.stringify( datafile.data, null, 2 ) } 
    } );

    this.saving = true;
    this.http.post( url, { files : files }, { headers : headers } )
      .subscribe( data => {
        console.log( "saved", data );
        this.saving = false;
        this.datafiles.forEach( datafile => datafile.updateOriginalState() );
        this.showToast( "Data Saved" );
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

interface IDataFile
{ filename:string; data; busy:boolean; dataHasChanged:boolean; updateOriginalState():void;  checkForChanges():void }

class DataFile<T> implements IDataFile
{
  private readonly URL_FILE:string = "https://gist.githubusercontent.com/choephix/4c390b3e5502811d196233104c89f755/raw/";
  public data:T;
  public busy:boolean;

  public dataOriginalJson:string;
  public dataHasChanged:boolean;
  
  constructor( public filename:string, private http:HttpClient ) { }
  
  public load( callbackLoaded : (data:T) => void ):void
  {
    console.log( "loading " + this.filename );
    
    const headers = new HttpHeaders();
    headers.set( "content-type", "application/json" );
    headers.set( 'cache-control', 'no-cache' );
    // headers.set( 'x-apikey', '5acb82b08f64a5337173a18a' );
    
    this.busy = true;
    var url_cards:string = this.URL_FILE + this.filename + this.cacheBustSuffix();
    this.http.get(url_cards,{headers:headers}).subscribe( data => {
      console.log( "loaded "+this.filename, data );
      this.busy = false;
      this.data = <T>data;
      this.updateOriginalState();
      callbackLoaded( this.data );
    } );
  }

  public updateOriginalState():void
  {
    this.dataOriginalJson = JSON.stringify( this.data );
    this.dataHasChanged = false;
  }
  
  public checkForChanges():void
  {
    this.dataHasChanged = this.dataOriginalJson != JSON.stringify( this.data );
  }
  
  private cacheBustSuffix():string { return '?' + ( new Date().valueOf() % 1000000 ) }
}

class ConfigurationData
{
  public cardSections:CardSectionData[] = [
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
    {subsections:[{funcIndex:0,header:"One"},{funcIndex:0,header:"Two"},{funcIndex:0,header:"Three"},{funcIndex:0,header:"Four"}]},
  ];
}

class GUID {
  static make() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
  }
}