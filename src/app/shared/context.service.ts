import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',

})
export class ContextService {
  subject = new Subject<any>(); 
  
  constructor(public router: Router) { }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
  sendMessage(message: string) {
    this.subject.next({ text: message });
  }

}
