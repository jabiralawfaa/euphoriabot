import fs from "node:fs";
import { saveToJson } from "./helper";

export class BadWordFilter {
  private badWords: string[] = [];
  private regexList: RegExp[] = [];

  constructor() {
    this.loadBadword();
  }

  /**
   * Regenerasi regexList dari badWords (dipanggil internal)
   */
  private syncRegex(): void {
    this.regexList = this.badWords.map((word) => new RegExp(word, "i"));
  }

  public loadBadword(): void {
    try {
      const data: string = fs.readFileSync("./src/keywords/list_badword.json", "utf-8");
      const parsedData = JSON.parse(data);

      const extractWord = (item: any): string | null => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object" && item.kata) {
          return extractWord(item.kata);
        }
        return null;
      };

      if (parsedData && Array.isArray(parsedData.listBadword)) {
        const loadedWords = parsedData.listBadword.map(extractWord).filter((word: string | null): word is string => word !== null);

        this.badWords = [...new Set(loadedWords)] as string[];
      }
    } catch (error) {
      this.badWords = [];
    }
    this.syncRegex();
  }

  public addBadWord(word: string): void {
    if (!this.badWords.includes(word)) {
      this.badWords.push(word);
      this.syncRegex();
    }
  }

  public addBadWords(words: string[]): void {
    words.forEach((word) => {
      if (!this.badWords.includes(word)) this.badWords.push(word);
    });
    this.syncRegex();
  }

  public removeBadWord(word: string): void {
    this.badWords = this.badWords.filter((badWord) => badWord !== word);
    this.syncRegex();
  }

  public getBadWords(): string[] {
    return [...this.badWords];
  }

  public saveToKeywordFilter(): boolean {
    const formatted = {
      listBadword: this.badWords.map((kata) => ({ kata })),
    };
    return saveToJson("./src/keywords/list_badword.json", formatted);
  }

  public checkThisTextBadWord(text: string): boolean {
    const lower = text.toLowerCase();
    return this.regexList.some((pattern) => pattern.test(lower));
  }
}
