import { Entries } from "./entries";

export class JournalEntry {
    id: number;
    reference: string;
    date: string;
    narration: string;
    entries: Entries[];
    branch: string;
}