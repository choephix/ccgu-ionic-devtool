import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events, ToastController } from 'ionic-angular';
import { CardModel, PDCharacterData, CardData, CardType, CardSectionData, DeckData } from '../../app/models';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

@Injectable()
export class DataProvider
{
  private readonly FILE_CARDS:string = "card-models.json";
  private readonly FILE_CONFIG:string = "editor-stuff.json";
  private readonly FILE_PDC:string = "pdc.json";
  private readonly FILE_DECKS:string = "decks.json";

  public cardsMap = new Map<number,CardModel>();
  public pdcMap = new Map<string,PDCharacterData>();

  public config:DataFile<ConfigurationData>;
  public cards:DataFile<CardData[]>;
  public pdc:DataFile<PDCharacterData[]>;
  public decks:DataFile<DeckData[]>;

  public datafiles:IDataFile[];
  
  private saving:boolean;
  
  constructor( private http:HttpClient, public events:Events, private toast:ToastController ) 
  {
    this.config = new DataFile<ConfigurationData>( this.FILE_CONFIG, http );
    this.cards = new DataFile<CardData[]>( this.FILE_CARDS, http );
    this.pdc = new DataFile<PDCharacterData[]>( this.FILE_PDC, http );
    this.decks = new DataFile<DeckData[]>( this.FILE_DECKS, http );

    this.config.data = new ConfigurationData();

    this.datafiles = [ this.config, this.cards, this.pdc, this.decks ];

    this.loadAll();

    setInterval( () => this.checkForChanges(), 2500 );
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

  public findCardBySlug(slug:string):CardModel
  {
    return this.cardsMap[this.findCardDataBySlug(slug).id];
    // for( let card of Array.from( this.cardsMap.values() ) )
    //   if ( card.properties.slug == slug )
    //     return card;
    // return null;
  }

  public findCardDataBySlug(slug:string):CardData
  {
    for (let i = 0; i < this.cards.data.length; i++)
      if ( this.cards.data[i].slug == slug )
        return this.cards.data[i];
    return null;
  }

  ///

  private loadAll():void
  {
    console.log( "loading data from github gist" );

    this.config.load( data => this.onLoaded_Configuration( data ) );
    this.cards.load( data => this.onLoaded_Cards( data ) );
    this.pdc.load( data => this.onLoaded_PDCharacters( data ) );
    this.decks.load( data => this.onLoaded_Decks( data ) );
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
    for ( let i = data.length - 1; i >= 0; i--)
      this.pdcMap[data[i].guid] = data[i];

    this.events.publish( "data:reload" );
  }

  private onLoaded_Decks( data:DeckData[] )
  {
    // for ( let i = 4; i < 64; i++ )
    //   this.decks.data.push({name:"("+i+")",slugs:[]})

    this.events.publish( "data:reload" );
  }

  public sortPDCs():void
  {
    this.pdc.data.sort( sortFunction );
    function sortFunction(aa:PDCharacterData,bb:PDCharacterData):number
    {
      let a:string = aa.origin.toUpperCase() + aa.name.toUpperCase();
      let b:string = bb.origin.toUpperCase() + bb.name.toUpperCase();
      return a < b ? -1 : a > b ? 1 : 0;
    }
  }

  public saveAll():void
  {
    // this.sortPDCs();
    this.datafiles.forEach( datafile => datafile.save( console.log ) );
  }

  public saveAll_OLD():void
  {
    this.sortPDCs();

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
{ 
  data; 
  filename:string; 
  busy:boolean; 
  dataHasChanged:boolean; 
  save( callbackSaved : () => void ):void;  
  updateOriginalState():void;  
  checkForChanges():void 
}

class DataFile<T> implements IDataFile
{
  // private readonly URL_FILE:string = "https://raw.githubusercontent.com/choephix/ccgu-loadable-data/master/";
  public data:T;
  public busy:boolean;

  public sha:string;

  public dataOriginalJson:string;
  public dataHasChanged:boolean;
  
  constructor( public filename:string, private http:HttpClient ) { }
  
  public load( callbackLoaded : (data:T) => void ):void
  {
    console.log( "loading " + this.filename );

    let url:string = "https://api.github.com/repos/choephix/ccgu-loadable-data/contents/" 
                   + this.filename + this.cacheBustSuffix();
                  //  + this.filename;

    this.busy = true;
    this.http.get( url ).subscribe( data => {
      this.onLoadResponse( <GithubGetContentsResponse>data );
      callbackLoaded( this.data );
    } );
    
    // const headers = new HttpHeaders();
    // headers.set( "content-type", "application/json" );
    // headers.set( 'cache-control', 'no-cache' );
    // headers.set( 'x-apikey', '5acb82b08f64a5337173a18a' );
  }

  private onLoadResponse( data:GithubGetContentsResponse ):void
  {
    console.log( "loaded "+this.filename, data );
    this.busy = false;
    this.sha = data.sha;
    this.data = <T>JSON.parse(B64UTF8.Decode(data.content));
    this.updateOriginalState();
  }

  public save( callbackSaved : () => void ):void
  {
    if ( !this.dataHasChanged )
    {
      console.log( this.filename + " - nothng changed to save" );
      return;
    }

    let url:string = "https://api.github.com/repos/choephix/ccgu-loadable-data/contents/" + this.filename;
    let body = {
      message : "update from online tool",
      content : B64UTF8.Encode(JSON.stringify( this.data, null, 2 )),
      sha : this.sha
    };

    let token:string = "";
    token += "5180f8d9";
    token += "6e8077d5";
    token += "03b06fe2";
    token += "3df10fd7";
    token += "accbea88";

    let headers = new HttpHeaders().set( "Authorization", "token  " + token );

    this.http.put( url, body, { headers : headers } )
      .subscribe( data => {
        console.log( data );
        this.onSaveResponse( <GithubUpdateContentsResponse>data );
        callbackSaved();
       } );
  }

  private onSaveResponse( data:GithubUpdateContentsResponse ):void
  {
    this.sha = data.content.sha;
    this.updateOriginalState();
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

class GithubGetContentsResponse
{
  public name:string;
  public path:string;
  public sha:string;
  public download_url:string;
  public content:string;
  public encoding:string;
  public size:number;
}

class GithubUpdateContentsResponse
{
  public content:GithubGetContentsResponse;
  public commit:object;
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

class B64UTF8 {
  /*
  * Function to convert from UTF8 to Base64 solving the Unicode Problem
  * Requires: window.btoa and window.encodeURIComponent functions
  * More info: http://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
  * Samples:
  *      b64EncodeUnicode('✓ à la mode'); // "4pyTIMOgIGxhIG1vZGU="
  *      b64EncodeUnicode('\n'); // "Cg=="
  */
  public static Encode(str: string): string {
    if (window
        && "btoa" in window
        && "encodeURIComponent" in window) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode(("0x" + p1) as any);
        }));
    } else {
        console.warn("b64EncodeUnicode requirements: window.btoa and window.encodeURIComponent functions");
        return null;
    }

  }

  /*
  * Function to convert from Base64 to UTF8 solving the Unicode Problem
  * Requires window.atob and window.decodeURIComponent functions
  * More info: http://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
  * Samples:
  *      b64DecodeUnicode('4pyTIMOgIGxhIG1vZGU='); // "✓ à la mode"
  *      b64DecodeUnicode('Cg=='); // "\n"
  */
  public static Decode(str: string): string {
    if (window
        && "atob" in window
        && "decodeURIComponent" in window) {
        return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));
    } else {
        console.warn("b64DecodeUnicode requirements: window.atob and window.decodeURIComponent functions");
        return null;
    }
  }
}