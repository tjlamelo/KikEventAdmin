import { Component, OnDestroy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashMessageService } from './service/flash-message.service';
 
@Component({
  selector: 'app-flash-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flash-message.component.html',
  styleUrls: ['./flash-message.component.scss'],
  animations: [
   
  ]
})
export class FlashMessageComponent implements OnDestroy {
  // Signaux pour la réactivité
  message = signal<string | null>(null);
  type = signal<'success' | 'error' | 'warning' | 'info'>('info');
  isExiting = signal<boolean>(false);
  
  // Injection avec inject()
  private flashService = inject(FlashMessageService);
  
  // Signaux calculés
  alertClass = computed(() => {
    switch (this.type()) {
      case 'success': return 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 shadow-green-200/30';
      case 'error':   return 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 shadow-red-200/30';
      case 'warning': return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 shadow-amber-200/30';
      case 'info':    return 'bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-blue-500 shadow-blue-200/30';
      default:        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-500 shadow-gray-200/30';
    }
  });
  
  iconClass = computed(() => {
    switch (this.type()) {
      case 'success': return 'fa-check-circle text-green-500';
      case 'error':   return 'fa-exclamation-circle text-red-500';
      case 'warning': return 'fa-exclamation-triangle text-amber-500';
      case 'info':    return 'fa-info-circle text-blue-500';
      default:        return 'fa-info-circle text-gray-500';
    }
  });
  
  // Timeout ID pour le nettoyage
  private timeoutId: number | null = null;
  
  constructor() {
    // Utilisation d'un effet pour gérer les abonnements
    effect((onCleanup) => {
      const subscription = this.flashService.currentMessage.subscribe(msg => {
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }

        if (msg) {
          this.isExiting.set(false);
          this.message.set(msg.message);
          this.type.set(msg.type);

          if (msg.duration) {
            this.timeoutId = window.setTimeout(() => this.startExit(), msg.duration);
          }
        } else {
          this.startExit();
        }
      });
      
      // Nettoyage de l'abonnement
      onCleanup(() => subscription.unsubscribe());
    });
  }

  ngOnDestroy(): void {
    this.clearMessage();
  }

  startExit() {
    this.isExiting.set(true);
    this.timeoutId = window.setTimeout(() => {
      this.message.set(null);
      this.isExiting.set(false);
    }, 300);
  }

  clearMessage(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.startExit();
  }
}