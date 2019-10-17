import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { User } from '../../models/user';
import { AngularFireAuth } from "angularfire2/auth";
import { ConfigServiceProvider } from '../../providers/config-service/config-service';

/**
 * Generated class for the LoginPage page.npm install -g firebase-tools
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  
  user = {} as User;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private afAuth: AngularFireAuth, public configService: ConfigServiceProvider) {
  }

  async login(){
    try {
      const result = await this.afAuth.auth.signInWithEmailAndPassword(this.user.email, this.user.password);
      console.log("login() success", result );
      if(result){
        this.navCtrl.setRoot("HomePage", {login: result});
      }
      
    } catch (err) {
      console.log("login() error>", err);
      this.configService.showToast2("Correo o contraseña incorrectos", "toast-failed");
    }
  }

}
