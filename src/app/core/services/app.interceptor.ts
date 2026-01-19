import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { LoaderService } from '../../shared/components/loader/service/loader.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { UserHelper } from '../../shared/helpers/user';
import { LocalStorage } from '../../shared/helpers/localStorage';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'danger';

export const appInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  loaderService.show();

  // 1. GESTION DU TOKEN D'AUTHENTIFICATION
  let authReq = req;
  if (UserHelper.isConnect()) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${LocalStorage.getItem('jbis_space_token')}`
      }
    });
  }

  return next(authReq).pipe(
    tap((event) => {
      // On peut intercepter les succès ici si besoin (ex: logs de debug)
      if (event instanceof HttpResponse) {
        // Optionnel : On pourrait logger event.body.message ici
      }
    }),
    finalize(() => {
      loaderService.hide();
    }),
    catchError((error: HttpErrorResponse) => {
      return handleHttpError(error, toastService, router);
    })
  );
};

/**
 * GESTIONNAIRE D'ERREURS CENTRALISÉ
 * Interprète la structure BaseResponse du Backend
 */
function handleHttpError(
  error: HttpErrorResponse,
  toastService: ToastService,
  router: Router
): Observable<never> {
  let type: ToastType = 'error';
  let timeout = 5000;
  
  // On récupère le message envoyé par BaseResponse (Backend)
  // error.error correspond au JSON retourné par ton buildResponse(...)
  let message = error.error?.message || 'Une erreur est survenue';

  if (error.error instanceof ErrorEvent) {
    // Erreur côté Client (Réseau/Navigateur)
    message = 'Erreur réseau - Vérifiez votre connexion';
  } else {
    // Erreur côté Serveur (interprétation des status de ta BaseResponse)
    switch (error.status) {
      case 0:
        message = 'Serveur injoignable (CORS ou Down)';
        break;
      case 400:
        type = 'warning'; // Bad Request (ex: validation de formulaire)
        break;
      case 401:
        message = error.error?.message || 'Session expirée - Reconnexion requise';
        router.navigate(['/login']);
        break;
      case 403:
        message = 'Vous n\'avez pas les droits nécessaires';
        router.navigate(['/']);
        break;
      case 404:
        type = 'info';
        message = error.error?.message || 'Ressource introuvable';
        break;
      case 409:
        type = 'warning'; // Conflict (ex: profil déjà existant)
        break;
      case 422:
        type = 'warning'; // Unprocessable Entity
        break;
      case 500:
        type = 'danger';
        message = 'Erreur serveur interne (500)';
        break;
      case 503:
        message = 'Service temporairement indisponible';
        break;
      default:
        // Garde le message extrait de error.error.message par défaut
        break;
    }
  }

  toastService.show(type, message, timeout);
  return throwError(() => error);
}