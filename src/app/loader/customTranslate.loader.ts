import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

const LOCAL_URL = 'https://saasnct-languages.s3.ap-south-1.amazonaws.com';

export class CustomTranslateLoader implements TranslateLoader {
  
  constructor(private httpClient: HttpClient) {
      
  }

  getTranslation(lang: string): Observable<any> {
    const url = `${LOCAL_URL}/language/app/ledger/${lang}.json`;

    return this.httpClient.get(url).pipe(catchError((_) => this.httpClient.get(`../assets/language/enUS.json`)));
  }
}