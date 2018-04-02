import { CardModel } from './../../app/models';
import { Component } from '@angular/core';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage 
{
  private static readonly PAGE_CARDS_COUNT:number = 256;

  cards:CardMap = {};
  cardViews: Array<CardView> = [];

  selectedBundle : CardViewBundle = null;
  bundles : Array<CardViewBundle> = [];

  public minCardWidth:number = 157;
  public minCardHeight:number = 120;
  public cardMargin:number = 1;
  public marginX:number = 8;
  public marginY:number = 16;

  public cardWidth:number;
  public cardHeight:number;
  public cardXFactor:number;
  public cardYFactor:number;
  public cardColumnsCount:number;
  public cardRowsCount:number;
  
  public moveMode:boolean;
  public selectedIndices:Array<number> = [];

  constructor()
  {
    this.cards = FakeCardsData.getData();

    this.cardColumnsCount = 16;
    this.cardRowsCount = Math.ceil( ListPage.PAGE_CARDS_COUNT / this.cardColumnsCount );

    this.cardWidth = this.minCardWidth;
    this.cardHeight = this.minCardHeight;

    this.cardXFactor = this.cardWidth + this.cardMargin;
    this.cardYFactor = this.cardHeight + this.cardMargin;

    for ( let i = 0; i < 16; i++ )
      this.bundles.push( { 
           startIndex : i * ListPage.PAGE_CARDS_COUNT, 
           name : i.toString(16) } );

    for (let i = 0; i < 13; i++)
    {
        this.cards[64+i] = new CardModel();
        this.cards[64+i].slug = "gagagigo";
        this.cards[64+i].name = "gagagigo";
        this.cards[64+i].power = i;
        this.cards[64+i].status = i;
    }

    for (let i = 0; i < ListPage.PAGE_CARDS_COUNT; i++)
      this.cardViews.push( { index : i, data : null } );

    this.selectBundle(this.bundles[0]);
    this.moveMode = true;
  }

  public onSelect(card:CardView)
  {
    if ( this.selectedIndices.length < 1 )
    {
      if ( this.hasData( card ) )
        card.data.power++;
      this.selectedIndices.push( card.index );
    }
    else
    if ( this.selectedIndices.indexOf( card.index ) >= 0 )
    {
      this.selectedIndices.splice( this.selectedIndices.indexOf( card.index ), 1 );
    }
    else
    {
      for (let i = 0; i < this.selectedIndices.length; i++)
      {
        var iA:number = card.index + i;
        var iB:number = this.selectedIndices[i];

        var vA:CardView = this.cardViews[ iA ];
        var vB:CardView = this.cardViews[ iB ];
        var cA:CardModel = vA.data;
        var cB:CardModel = vB.data;
        var idA:number = this.getSupposedCardID( vA );
        var idB:number = this.getSupposedCardID( vB );

        if ( cA ) cA.id = idB;
        if ( cB ) cB.id = idA;

        this.cards[idA] = vA.data = cB;
        this.cards[idB] = vB.data = cA;

        console.log( "swapped " + idA + " with " + idB );
      }

      this.selectedIndices.length = 0;
      this.selectBundle(this.selectedBundle);
    }

    console.log( "Selected: " + this.selectedIndices );
  }

  public getSupposedCardID( cv:CardView )
  { return this.selectedBundle.startIndex + cv.index; }

  public hasData( card:CardView ):boolean { return card.data != null && card.data != undefined }
  public isSelected( card:CardView ) { return this.selectedIndices.indexOf( card.index ) >= 0 }

  public getX( i:number ):number { return this.marginX + Math.floor( i % this.cardColumnsCount ) * this.cardXFactor; }
  public getY( i:number ):number { return this.marginY + Math.floor( i / this.cardColumnsCount ) * this.cardYFactor; }
  public getColorClass( card:CardView )
  {
    var col:number = Math.floor( card.index % this.cardColumnsCount );
    if ( col < 2 ) return "sneak";
    if ( col < 10 ) return "normal";
    if ( col < 12 ) return "grand";
    return "trap";
  }

  public selectBundle( bundle:CardViewBundle ): void 
  {
    this.selectedBundle = bundle;
    for (let i = 0; i < ListPage.PAGE_CARDS_COUNT; i++)
      this.cardViews[ i ].data = this.cards[ i + bundle.startIndex ];
  }
}

export class CardView {
  data:CardModel;
  index:number;
}

export class CardViewBundle {
  name: string;
  startIndex: number;
}

export class CardMap {[id:number]:CardModel}

export class FakeCardsData {
  public static getData():CardMap
  {
    var data: object[] = JSON.parse(this.JSONDATA);
    var result:CardMap = new CardMap();

    for (let i = 0; i < data.length; i++)
    {
      var card:CardModel = this.dataToCardModel( data[i] );
      result[ card.id ] = card;
    }

    return result;
  }

  private static dataToCardModel( o:object ):CardModel
  {
    var c:CardModel = new CardModel();
    c.id = o["ID"];
    c.slug = o["Slug"];
    c.name = o["Name"];
    c.isTrap = o["IsTrap"];
    c.power = o["Power"];
    c.status = o["Status"];
    c.description = o["Description"];
    return c;
  }

  public static JSONDATA:string = "[{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"drawdraw\",\"Name\":null,\"Char\":\"N\",\"Power\":0,\"Description\":\"Activate when your opponent draws a card. Until the end of their turn, every time they draw a card, you draw a card as well.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32848,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"drawnecro\",\"Name\":null,\"Char\":\"8\",\"Power\":0,\"Description\":\"Activate when opponent draws a card, if the top card in their grave is a unit card. \\nResurrect it on your side at this column.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32847,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"nameless-804f\",\"Name\":\"OP!\",\"Char\":\"N\",\"Power\":0,\"Description\":\"Activate when opposing enemy unit is deployed and force it to attack.\",\"Priority\":3,\"Rarity\":6,\"Status\":0,\"ID\":32847,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"nameless-804e\",\"Name\":null,\"Char\":\"N\",\"Power\":0,\"Description\":\"Activate when an enemy unit is deployed and the opposing unit field is empty. Move the unit there.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32846,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"nameless-804c\",\"Name\":null,\"Char\":\"N\",\"Power\":7,\"Description\":\"On death: enemy is healed for %4 hp\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32844,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"nameless-804b\",\"Name\":null,\"Char\":\"N\",\"Power\":14,\"Description\":\"#Grand On death: enemy is healed for %10 hp\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32843,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"relokill\",\"Name\":null,\"Char\":\"N\",\"Power\":0,\"Description\":\"Activate when opposing enemy unit starts relocation. Kill it.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32841,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"lockhead\",\"Name\":null,\"Char\":\"L\",\"Power\":0,\"Description\":\"#Grand The opposing enemy field is locked while I am in play\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32838,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"trapbomb\",\"Name\":\"Balanced Antitrap\",\"Char\":\"B\",\"Power\":0,\"Description\":\"Activate when opposing enemy $trap activates. Before the effect, destroy it and all units on my lane.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32837,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"traplode\",\"Name\":null,\"Char\":\"t\",\"Power\":0,\"Description\":\"#Grand Before any trap on either side activates - destroy it. If so, I die at the end of that turn.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32836,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"chickeng1\",\"Name\":null,\"Char\":\"c\",\"Power\":14,\"Description\":\"#Grand When opposing enemy unit attacks, I return to your hand. The attack continues.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32835,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"toxicmine\",\"Name\":null,\"Char\":\"N\",\"Power\":0,\"Description\":\"Activate when opposing enemy unit is deployed. Decrease its power by\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32842,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"autoatk\",\"Name\":null,\"Char\":\"A\",\"Power\":4,\"Description\":\"I perform a free attack when deployed\",\"Priority\":3,\"Rarity\":0,\"Status\":2,\"ID\":32834,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"quickgiver-0\",\"Name\":null,\"Char\":\"Q\",\"Power\":0,\"Description\":\"#Persistent. Activate when $enemy's turn begins. When you deploy a unit on this lane, give it storm and destroy this trap.\",\"Priority\":1,\"Rarity\":0,\"Status\":12,\"ID\":32828,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"quickgiver-g\",\"Name\":null,\"Char\":\"Q\",\"Power\":7,\"Description\":\"When I am $deployed - end your turn.\\nWhenever any other $unit is about to be $deployed, give it Storm until turn end.\",\"Priority\":3,\"Rarity\":0,\"Status\":12,\"ID\":32829,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"quickgiver-1\",\"Name\":null,\"Char\":\"q\",\"Power\":2,\"Description\":\"When I am $deployed - end your turn.\\nWhenever any other $unit is about to be $deployed, give it Storm until turn end.\",\"Priority\":1,\"Rarity\":0,\"Status\":12,\"ID\":32827,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"needsmotivation\",\"Name\":null,\"Char\":\"m\",\"Power\":3,\"Description\":\"Increase my $power by %2 for every $friendly adjacent $unit.\",\"Priority\":3,\"Rarity\":0,\"Status\":2,\"ID\":32830,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"eggshell\",\"Name\":null,\"Char\":\"e\",\"Power\":0,\"Description\":\"#Storm Use me as surprise tribute.\",\"Priority\":3,\"Rarity\":0,\"Status\":4,\"ID\":32826,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"lonely-golem\",\"Name\":\"Lonely Golem\",\"Char\":\"L\",\"Power\":13,\"Description\":\"#Grand The moment there are no other $friendly $units - I $die.\",\"Priority\":3,\"Rarity\":0,\"Status\":2,\"ID\":32825,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"compromiser1\",\"Name\":\"Compromising Anna\",\"Char\":\"C\",\"Power\":8,\"Description\":\"#Grand I do not need a $tribute to be $deployed if there are no $friendly $units $in-play.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32824,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"epic-tortoise\",\"Name\":\"Epic Tortoise\",\"Char\":\"E\",\"Power\":14,\"Description\":\"#Grand After I $attack, I am $asleep until your next turn-end.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32823,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"sloth-wyrm\",\"Name\":\"Sloth Wyrm\",\"Char\":\"S\",\"Power\":15,\"Description\":\"#Grand I am $asleep for three turns after being deployed.\",\"Priority\":3,\"Rarity\":0,\"Status\":1,\"ID\":32822,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"killonattack\",\"Name\":null,\"Char\":\"K\",\"Power\":0,\"Description\":\"Activate after opposing enemy $unit finishes a direct attack. $Kill it.\",\"Priority\":3,\"Rarity\":0,\"Status\":2,\"ID\":32821,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"free-jimmy\",\"Name\":null,\"Char\":\"N\",\"Power\":2,\"Description\":\"Activate when I am deployed. Raise your $AP by %1.\",\"Priority\":3,\"Rarity\":0,\"Status\":2,\"ID\":32820,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"nosneaking\",\"Name\":null,\"Char\":\"N\",\"Power\":0,\"Description\":\"Activate when opposing enemy $unit is $deployed face-down. Flip it face-up, ignoring any flip-effects.\",\"Priority\":3,\"Rarity\":0,\"Status\":1,\"ID\":32817,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"punishtrap\",\"Name\":null,\"Char\":\"N\",\"Power\":0,\"Description\":\"Activate when opposing enemy $trap activates. Deal %3 damage to opponent.\",\"Priority\":9,\"Rarity\":0,\"Status\":5,\"ID\":32815,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"fury\",\"Name\":\"Fury\",\"Char\":\"F\",\"Power\":0,\"Description\":\"Activate when you are dealt direct damage by the opposing enemy $unit.\\nDestroy all enemy $units with $power lower than that damage.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32814,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"cowardly-giant\",\"Name\":\"Cowardly Giant\",\"Char\":\"C\",\"Power\":14,\"Description\":\"#Grand After I am attacked by enemy $unit, if I'm still in play, I return to my owner's hand.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32813,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"antisocial-knight\",\"Name\":\"Antisocial Knight\",\"Char\":\"A\",\"Power\":9,\"Description\":\"My power is decreased by %3 for every other friendly $unit $in-play.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32812,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"flipouch\",\"Name\":null,\"Char\":\"N\",\"Power\":5,\"Description\":\"#Sneak Flip: Take %1 damage.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32811,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"vampirefang\",\"Name\":null,\"Char\":\"V\",\"Power\":2,\"Description\":\"Any direct damage I deal in $combat, is added to your $health.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32810,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"spearhead\",\"Name\":null,\"Char\":\"S\",\"Power\":1,\"Description\":\"#Piercing\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32809,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"honoraro\",\"Name\":null,\"Char\":\"H\",\"Power\":6,\"Description\":\"#Grand Adjacent friendly $units's power is raised by %2.\",\"Priority\":7,\"Rarity\":0,\"Status\":2,\"ID\":32808,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"nimbleguard\",\"Name\":null,\"Char\":\"\u2622\",\"Power\":2,\"Description\":\"When an enemy $unit is $deployed, if possible, move me in front of it.\",\"Priority\":1,\"Rarity\":0,\"Status\":2,\"ID\":32807,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"elijah\",\"Name\":null,\"Char\":\"\u00BE\",\"Power\":3,\"Description\":\"My $power is raised by %4 during the enemy's turn\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32806,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"joshua\",\"Name\":null,\"Char\":\"\u2157\",\"Power\":3,\"Description\":\"My $power is raised by %3 during your turn.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32805,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"cardfactory1\",\"Name\":null,\"Char\":\"\u00A9\",\"Power\":7,\"Description\":\"#Grand Draw a card at the end of your turn\",\"Priority\":5,\"Rarity\":0,\"Status\":2,\"ID\":32804,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"fateforward\",\"Name\":\"Fate Forward\",\"Char\":\"\u039E\",\"Power\":4,\"Description\":\"#Sneak Combat-Flip: Both $players draw %2 cards\",\"Priority\":4,\"Rarity\":0,\"Status\":0,\"ID\":1036,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"fragmine\",\"Name\":null,\"Char\":\"?\",\"Power\":0,\"Description\":\"#Sneak #NoAttack #NoMove I die after $combat\",\"Priority\":7,\"Rarity\":0,\"Status\":2,\"ID\":1037,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"shield2\",\"Name\":\"Another Fucking Shield\",\"Char\":\"\u25CA\",\"Power\":7,\"Description\":\"#Sneak #NoAttack #NoMove Combat-Flip: Die\",\"Priority\":5,\"Rarity\":0,\"Status\":2,\"ID\":1035,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"shield1\",\"Name\":\"Another Fucking Shield\",\"Char\":\"\u25CA\",\"Power\":5,\"Description\":\"#Sneak #NoAttack\",\"Priority\":5,\"Rarity\":0,\"Status\":2,\"ID\":1034,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"token-summoner4\",\"Name\":\"Warrior-Hen\",\"Char\":\"\u20B8\",\"Power\":4,\"Description\":\"When I die, $deploy @token0 in my place\",\"Priority\":8,\"Rarity\":0,\"Status\":1,\"ID\":1033,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"grandtraitor\",\"Name\":\"Grand Traitor\",\"Char\":\"\u2195\",\"Power\":14,\"Description\":\"#Grand The moment there are no other friendly $units and no opposing enemy $unit, I move to the enemy's side\",\"Priority\":6,\"Rarity\":0,\"Status\":2,\"ID\":1032,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"man-of-honor\",\"Name\":\"Man of Honor\",\"Char\":\"\u2666\",\"Power\":7,\"Description\":\"I cannot attack if there is no opposing enemy $unit\",\"Priority\":8,\"Rarity\":0,\"Status\":2,\"ID\":1025,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"expolosive-mech\",\"Name\":\"Expolosive Mech\",\"Char\":\"\u2736\",\"Power\":14,\"Description\":\"#Grand I cannot be $deployed manually while you have less than %3 $units in play (tribute included)\\rWhen I die, destroy all other friendly $units in play\",\"Priority\":6,\"Rarity\":0,\"Status\":2,\"ID\":1026,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"paulgrand\",\"Name\":\"Grand-Paul\",\"Char\":\"\u2660\",\"Power\":8,\"Description\":\"#Grand When I am $deployed, if there is an opposing enemy $unit, I do not suffer $summon-exhaustion.\",\"Priority\":9,\"Rarity\":0,\"Status\":2,\"ID\":1027,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"dual-force-spirit\",\"Name\":\"Dual Force Spirit\",\"Char\":\"\u2194\",\"Power\":0,\"Description\":\"#GrandRaise my $power by the combined base $power of my adjacent friendly $units.\",\"Priority\":3,\"Rarity\":0,\"Status\":2,\"ID\":1028,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"eddy\",\"Name\":\"Edinson\",\"Char\":\"\u00CA\",\"Power\":4,\"Description\":\"When I am $deployed, if possible:\\rIf @ed is in play, add @edd from your deck to your hand.\\rIf @edd is in play, add @ed from your deck to your hand\",\"Priority\":3,\"Rarity\":0,\"Status\":1,\"ID\":1031,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"edd\",\"Name\":\"Edmundo\",\"Char\":\"\u00CB\",\"Power\":4,\"Description\":\"When I am $deployed, if possible:\\rIf @ed is in play, add @eddy from your deck to your hand.\\rIf @eddy is in play, add @ed from your deck to your hand\",\"Priority\":3,\"Rarity\":0,\"Status\":1,\"ID\":1030,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"ed\",\"Name\":\"Edward\",\"Char\":\"\u00C8\",\"Power\":4,\"Description\":\"When I am $deployed, if possible:\\rIf @edd is in play, add @eddy from your deck to your hand.\\rIf @eddy is in play, add @edd from your deck to your hand\",\"Priority\":3,\"Rarity\":0,\"Status\":1,\"ID\":1029,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"berserker\",\"Name\":null,\"Char\":\"\u2034\",\"Power\":6,\"Description\":\"I attack automatically on at the start of your turn.\\nThis counts as a manual attack to my $action-exhaustion.\",\"Priority\":7,\"Rarity\":0,\"Status\":4,\"ID\":409,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"mercenery\",\"Name\":null,\"Char\":\"$\",\"Power\":6,\"Description\":\"Take %1 direct damage every time I begin an attack.\",\"Priority\":7,\"Rarity\":0,\"Status\":4,\"ID\":407,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"wall\",\"Name\":null,\"Char\":\"\u25A1\",\"Power\":7,\"Description\":\"#NoMove #NoAttack\",\"Priority\":6,\"Rarity\":0,\"Status\":4,\"ID\":410,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"kamikazejoe\",\"Name\":null,\"Char\":\"\u25B2\",\"Power\":2,\"Description\":\"#Storm #BadTribute I automatically attack when $deployed. I die after $combat.\",\"Priority\":8,\"Rarity\":0,\"Status\":3,\"ID\":402,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"harassingmia\",\"Name\":null,\"Char\":\"\u2191\",\"Power\":1,\"Description\":\"#Storm #BadTribute I return to your hand at the end of your turn.\",\"Priority\":9,\"Rarity\":0,\"Status\":4,\"ID\":401,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"doe2\",\"Name\":\"Jane Doe\",\"Char\":\"\u263A\",\"Power\":5,\"Description\":\"Just a gal\",\"Priority\":3,\"Rarity\":0,\"Status\":7,\"ID\":302,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"doe1\",\"Name\":\"John Doe\",\"Char\":\"\u263A\",\"Power\":5,\"Description\":\"Just a guy\",\"Priority\":3,\"Rarity\":0,\"Status\":7,\"ID\":301,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"doe0\",\"Name\":\"Random Dude\",\"Char\":\"\u263A\",\"Power\":5,\"Description\":\"No one knows his name. No one ever asked him either.\",\"Priority\":3,\"Rarity\":0,\"Status\":7,\"ID\":300,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"mirrorforce\",\"Name\":null,\"Char\":\"\u023A\",\"Power\":0,\"Description\":\"Activate when opposing enemy $unit attacks. Kill it.\",\"Priority\":6,\"Rarity\":0,\"Status\":3,\"ID\":273,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"tripwire\",\"Name\":null,\"Char\":\"\u25D8\",\"Power\":0,\"Description\":\"Activate when enemy $unit $relocates to opposing $field. Kill it.\",\"Priority\":6,\"Rarity\":0,\"Status\":3,\"ID\":272,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"traphole\",\"Name\":null,\"Char\":\"\u26A0\",\"Power\":0,\"Description\":\"Activate when an opposing enemy $unit is $deployed. Kill it.\",\"Priority\":6,\"Rarity\":8,\"Status\":3,\"ID\":271,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"flippers\",\"Name\":null,\"Char\":\"\u263B\",\"Power\":3,\"Description\":\"#Sneak\",\"Priority\":6,\"Rarity\":0,\"Status\":6,\"ID\":500,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"grand10\",\"Name\":null,\"Char\":\"\u263A\",\"Power\":10,\"Description\":\"#Grand\",\"Priority\":3,\"Rarity\":0,\"Status\":7,\"ID\":270,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"generic5\",\"Name\":null,\"Char\":\"\u263A\",\"Power\":5,\"Description\":\"\",\"Priority\":3,\"Rarity\":0,\"Status\":7,\"ID\":265,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"-kami\",\"Name\":null,\"Char\":\"N\",\"Power\":0,\"Description\":\"\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":32,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"-killany\",\"Name\":null,\"Char\":\"K\",\"Power\":0,\"Description\":\"kill first unit deployed\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":19,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"-infinitemana\",\"Name\":null,\"Char\":\"M\",\"Power\":0,\"Description\":\"+1AP on any deployment. die on turn start.\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":18,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"-muchdraw\",\"Name\":null,\"Char\":\"D\",\"Power\":2,\"Description\":\"draw %6 cards on deploy\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":17,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"-wildgrand\",\"Name\":\"The Wild One (G)\",\"Char\":\"\u25A0\",\"Power\":0,\"Description\":\"#grand -- Whatever you wish, dude.... --\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":5,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"-wildsneak\",\"Name\":\"The Wild One (Incognito)\",\"Char\":\"\u25A0\",\"Power\":0,\"Description\":\"#sneak -- Whatever you wish, dude.... --\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":4,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"-wildtrap\",\"Name\":\"Go Wild!\",\"Char\":\"\u25A0\",\"Power\":0,\"Description\":\"-- Whatever you wish, dude.... --\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":3,\"Type\":1},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"-wildunit\",\"Name\":\"The Wild One\",\"Char\":\"\u25A0\",\"Power\":0,\"Description\":\"-- Whatever you wish, dude.... --\",\"Priority\":3,\"Rarity\":0,\"Status\":0,\"ID\":2,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"-elvariablo\",\"Name\":\"El Variablo\",\"Char\":\"1\",\"Power\":0,\"Description\":\"#grand #swift #dev Increase my power by %10 while @wall is in play on your side\",\"Priority\":0,\"Rarity\":0,\"Status\":0,\"ID\":1,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"token5\",\"Name\":null,\"Char\":\"\u0372\",\"Power\":5,\"Description\":\"\",\"Priority\":0,\"Rarity\":0,\"Status\":7,\"ID\":135,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"token4\",\"Name\":null,\"Char\":\"\u0372\",\"Power\":4,\"Description\":\"\",\"Priority\":0,\"Rarity\":0,\"Status\":7,\"ID\":134,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"token3\",\"Name\":null,\"Char\":\"\u0372\",\"Power\":3,\"Description\":\"\",\"Priority\":0,\"Rarity\":0,\"Status\":7,\"ID\":133,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"token2\",\"Name\":null,\"Char\":\"\u0372\",\"Power\":2,\"Description\":\"\",\"Priority\":0,\"Rarity\":0,\"Status\":7,\"ID\":132,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"token1\",\"Name\":null,\"Char\":\"\u0372\",\"Power\":1,\"Description\":\"\",\"Priority\":0,\"Rarity\":0,\"Status\":7,\"ID\":131,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"token0\",\"Name\":null,\"Char\":\"\u0372\",\"Power\":0,\"Description\":\"\",\"Priority\":0,\"Rarity\":0,\"Status\":7,\"ID\":130,\"Type\":0},{\"propertyChangedArgs\":{\"PropertyName\":null},\"Slug\":\"token\",\"Name\":null,\"Char\":\"\u0372\",\"Power\":0,\"Description\":\"\",\"Priority\":0,\"Rarity\":0,\"Status\":7,\"ID\":128,\"Type\":0}]";
}