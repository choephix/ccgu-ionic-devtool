
export class CardModel {
    id: number = 0;
    slug: string;
    name: string = "";
    c: string = '';
    isTrap: boolean = false;
    power: number = 0;
    description: string = "";
    rarity: number = 0;
    priority: number = 0;
    status: number = 0;

    tags:Array<string> = ["Grand","storm","noattack"];

    public get prettyStatus():string {
        return "Unset";
        // return CardModel.StatusStrings[0];
    }

    public static StatusStrings:Array<string> = [
        "Draft",
        "Concept",
        "Unimplemented",
        "Unfinished",
        "Untested",
        "Alpha",
        "Beta",
        "NoArt",
        "Unpolished",
        "Ready",
        "Published",
        "Retired",
        "Skip"
    ];
}