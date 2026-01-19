// flash-message.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

export interface FlashMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class FlashMessageService {
  private messageSubject = new BehaviorSubject<FlashMessage | null>(null);
  public currentMessage = this.messageSubject.asObservable();

  constructor(private router: Router) {
    // this.router.events.pipe(filter(event => event instanceof NavigationEnd))
    //   .subscribe(() => this.clear()); // <-- supprimer cette ligne
  }

  show(message: FlashMessage) {
    this.messageSubject.next(message);
  }

  clear() {
    this.messageSubject.next(null);
  }
}
