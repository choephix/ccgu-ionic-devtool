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

  public config:DataFile<ConfigurationData>;
  public cards:DataFile<CardData[]>;
  public pdc:DataFile<PDCharacterData[]>;

  public datafiles:IDataFile[];
  
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

  public isBusy():boolean { return !this.datafiles.every( (v,i,a) => { return !v.busy } ) }
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

    this.cardsMap[id] = card;
    this.cards.data.push( card.properties );
    this.cards.dataHasChanged = true;

    return card;
  }

  public deleteCard( id:number ):void
  {
    delete this.cards[ id ];
    for ( let i = this.cards.data.length - 1; i >= 0; i--)
      if ( this.cards.data[i].id == id )
        this.cards.data.splice( i, 1 );
    this.cards.dataHasChanged = true;
  }

  public getCardSectionData(index:number):CardSectionData
  { return this.config.data.cardSections[index%this.config.data.cardSections.length] }

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
    this.cardsMap.clear();
    for ( let i = 0; i < data.length; i++ )
      this.cardsMap[ data[i].id ] = CardModel.makeFromData( data[i] );
    this.events.publish( "data:reload" );
  }
  
  private onLoaded_PDCharacters( data:PDCharacterData[] )
  {
    this.events.publish( "data:reload" );
    // this.characters = <PDCharacterData[]>data;
    // this.characters.sort( (a,b) => a.origin < b.origin ? -1 : 1 );
  }

  public saveAll():void
  {
    const url:string = "https://api.github.com/gists/4c390b3e5502811d196233104c89f755";
    const headers = new HttpHeaders().set( "Authorization", "token 92f64861cfd1d719939c0f16b617b77f849e13fd" );

    const files = {};
    this.datafiles.forEach( datafile => { files[datafile.filename] = { content : JSON.stringify( datafile.data ) } } );

    // this.http.post( url, { 
    //   files : [ 
    //     "card-models.json" : JSON.stringify( this.cards.data ) 
    //   ] 
    // }, { headers : headers } )
    this.http.post( url, { files : files }, { headers : headers } )
      .subscribe( data => {
        console.log( data );
        this.showToast( "Data Saved" );
        this.datafiles.forEach( datafile => datafile.updateOriginalState() );
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
    console.log( "loading data from github gist" );
    
    this.busy = true;
    var url_cards:string = this.URL_FILE + this.filename + this.cacheBustSuffix();
    this.http.get(url_cards).subscribe( data => {
      console.log( data );
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