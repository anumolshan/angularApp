import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  headerWithToken() {

    const header: any = {
        headers: new HttpHeaders({
            "Content-Type": "application/json",
            "Accept": "application/json",
            'Authorization': 'Bearer ' + sessionStorage.getItem('idToken')

        }),
        observe: "response",
    };
    return header;
}
headerWithBasic() {

    const header: any = {
        headers: new HttpHeaders({
            "Content-Type": "application/json",
            "Accept": "application/json"
        }),
        observe: "response",
    };
    return header;
}
headerWithoutAuth() {
    const header: any = {
        headers: new HttpHeaders({
            Accept: "*/*",
        }),
    };
    return header;
}
headerPostWithoutAuth() {
    const header: any = {
        headers: new HttpHeaders({
            "Content-Type": "application/json",
            "Accept": "application/json",
        }),
    };
    return header;
}

get(path: string): Observable<any> {
  return this.http
      .get(`${environment.api_url}${path}`, this.headerWithBasic())
      .pipe(catchError(this.handleError<any>(path)));
}
getT(path: string): Observable<any> {
  return this.http
      .get(`${environment.api_url}${path}`, this.headerWithToken())
      .pipe(catchError(this.handleError<any>(path)));
}
post(path: string, body: Object = {}): Observable<any> {
  return this.http
      .post(
          `${environment.api_url}${path}`,
          JSON.stringify(body),
          this.headerWithBasic()
      )
      .pipe(catchError(this.handleError<any>(path)));
}

put(path: string, body: Object = {}): Observable<any> {
  return this.http
      .put(
          `${environment.api_url}${path}`,
          JSON.stringify(body),
          this.headerWithBasic()
      )
      .pipe(catchError(this.handleError<any>(path)));
}
delete(path: string): Observable<any> {
    return this.http
        .delete(
            `${environment.api_url}${path}`,       
            this.headerWithBasic()
        )
        .pipe(catchError(this.handleError<any>(path)));
  }

public handleError<T>(operation = "operation", result?: T) {
  return (error: any): Observable<T> => {

      if (error.status === 401) {

      }

      console.error("error:", error);
      // TODO: better job of transforming error for user consumption

      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.

      return of(result as T);
  };
}
}
