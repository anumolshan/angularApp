export interface Journal {
    id?:string;
    account?:string;
    narration?:string;
    currency?:string;
    foreign_credit?:number;
    foreign_debit?:number;
    rate?:string;
    base_credit?:string;
    base_debit?:string;

}