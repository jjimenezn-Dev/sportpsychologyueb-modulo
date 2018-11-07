import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from 'ionic-angular';

@Injectable()
export class ConfigServiceProvider {

  loading: any;
  loading2: any;

  constructor(public http: HttpClient,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController) {
    console.log('Hello ConfigServiceProvider Provider');
  }

  showLoader(msg: string) {
    if (!this.loading) {
      if (!msg) msg = "LOADING" + "...";
      this.loading = this.loadingCtrl.create({
        content: msg
      });
      this.loading.present();
    }
  }


  dismissLoader() {
    if (this.loading) {
      console.log("dismissLoader 1");
      this.loading.dismiss();
      this.loading = null;
    }
  }

  showLoader2(msg: string) {
    if (!this.loading2) {
      if (!msg) msg = "LOADING" + "...";
      this.loading2 = this.loadingCtrl.create({
        content: msg
      });
      this.loading2.present();
    }
  }

  dismissLoader2() {
    if (this.loading2) {
      console.log("dismissLoader 2");
      this.loading2.dismiss();
      this.loading2 = null;
    }
  }

  dismissAllLoaders() {
    console.log("dismissAllLoaders");
    this.dismissLoader();
    this.dismissLoader2();
  }

  showToast(msg: string) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 5000,
      showCloseButton: true,
      closeButtonText: 'X',
    });
    toast.present();
    console.log(msg)
  }

  showToast2(msg: string, style = "", error_status?: any) {
    let status = ""
    if (error_status) {
      status = "[" + error_status + "] ";
    }
    const toast = this.toastCtrl.create({
      message: status + msg,
      duration: 5000,
      showCloseButton: true,
      closeButtonText: 'X',
      cssClass: style,
    });
    toast.present();
  }

}
