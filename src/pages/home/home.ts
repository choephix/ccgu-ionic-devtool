import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CardModel } from '../../app/models';
import { CardViewPage } from '../card-view/card-view';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  cards : Array<CardModel> = [];

  constructor(public navCtrl: NavController) {
    
    // for ( var i = 0; i < 1024; i++ )
    //   this.cards.push({
    //       id:1+i,
    //       slug:"card-"+i,
    //       name:"Card "+i,
    //       description:"",
    //       c:"?",
    //       isTrap:false,
    //       power:0,
    //       rarity:0,
    //       priority:0,
    //       status:0,
    //       tags: ["Grand","storm","noattack"]
    //     });

    this.selectFilter(this.segments[0]);
  }


  public selectFilter(segment:CardFilter): void {
    this.selectedSegment = segment;
      // Handle what to do when a category is selected
  }

  // Method executed when the slides are changed
  public slideChanged(): void {
  }

  selectCard( card:CardModel ) {
    this.navCtrl.push(CardViewPage,{card:card});
  }

  selectedSegment : CardFilter = null

  segments : Array<CardFilter> = [
     { name : "0" },
     { name : "1" },
     { name : "2" },
     { name : "3" },
     { name : "4" },
     { name : "5" },
     { name : "6" },
     { name : "7" },
     { name : "8" },
     { name : "9" },
     { name : "A" },
     { name : "B" },
     { name : "C" },
     { name : "D" },
     { name : "E" },
     { name : "F" },
    ]

}

export class CardFilter {
  name: string;
}

/// All Dev 1..9 Tokens
/// Traps Units