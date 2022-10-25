import { viewLedgerEntries } from "./viewStatementEntries";
export class viewStatement{
    ledgerNo: number;
    fromDate: string;
    toDate: string;
    openingBalance: number;
    openingTypeCode: string;
    closingBalanceFC: number;
    closingBalanceLC: number;
    closingTypeCode: string;
    openingBalanceFc :number;
    entries: viewLedgerEntries[] = [];
}