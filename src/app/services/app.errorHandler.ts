import {ErrorHandler, Injectable, Injector} from '@angular/core';
import {UNAUTHORIZED, BAD_REQUEST, FORBIDDEN} from 'http-status-codes';
import {Router} from '@angular/router';
import {ToastsManager, Toast, ToastOptions} from 'ng2-toastr';

@Injectable()
export class AppErrorHandler implements ErrorHandler {

  private REFRESH_PAGE_ON_TOAST_CLICK_MESSAGE = 'An error occurred: Please click this message to refresh';
  private DEFAULT_ERROR_TITLE = 'Something went wrong';

  constructor(private injector: Injector) {}

  public handleError(error: any) {
    const message = error.message ? error.message : error.toString();
    console.error(error);
    const router = this.injector.get(Router);
    const httpErrorCode = error.httpErrorCode;
    switch (httpErrorCode) {
      case UNAUTHORIZED:
          router.navigateByUrl('/login');
          break;
      case FORBIDDEN:
          router.navigateByUrl('/unauthorized');
          break;
      case BAD_REQUEST:
         this.showError(message);
          break;
      default:
         this.showError(message);
    }
    // throw error;
  }

  private showError(message: string) {
    const toastManager = this.injector.get(ToastsManager);
    // toastManager.error(message, this.DEFAULT_ERROR_TITLE, { dismiss: 'controlled'}).then((toast: Toast) => {
    //        const currentToastId: number = toast.id;
    //       toastManager.onClickToast().subscribe(clickedToast => {
    //           if (clickedToast.id === currentToastId) {
    //               toastManager.dismissToast(toast);
    //               window.location.reload();
    //           }
    //       });
    //   });
     toastManager.error(message, this.DEFAULT_ERROR_TITLE);
  }
}
