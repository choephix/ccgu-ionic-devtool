import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CardModel, StatusViewGuru } from '../../app/models';

@IonicPage()
@Component({
  selector: 'page-card-view',
  templateUrl: 'card-view.html',
})
export class CardViewPage {

  card: CardModel;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.card = navParams.get("card");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CardViewPage');
  }

  delete() {
    this.navParams.get('params').del = true;
    this.navCtrl.pop();
  }

  save() {
    console.log('Save CardViewPage');
    this.navCtrl.pop();
  }

  setPower( value:number ):void
  {
    this.card.power = value;
    this.card.isTrap = false;
  }

  setStatus( value:number ):void   { this.card.status = value; }
  setPriority( value:number ):void { this.card.priority = value; }
  setRarity( value:number ):void   { this.card.rarity = value; }

  toggle( ...hidables:Element[] ):void
  {
    hidables.forEach( o => o.classList.toggle('hidden') );
  }

  public getPrettyStatusColor(value:number):string
  { return StatusViewGuru.ARRAY[value].color; }

  public getPrettyStatus(value:number):string
  { return StatusViewGuru.ARRAY[value].text; }

  public getColorClass()
  {
    if ( this.card.isTrap ) return "trap";
    if ( this.card.isGrand ) return "grand";
    if ( this.card.isSneak ) return "sneak";
    return "normal";
  }
}
