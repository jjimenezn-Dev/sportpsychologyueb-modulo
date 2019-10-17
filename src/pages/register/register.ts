import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { User } from '../../models/user';

import { AngularFireAuth } from "angularfire2/auth";

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  user = {} as User;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertController: AlertController,
    private afAuth: AngularFireAuth) {
  }

  
  async register(user:User){
    try {
      console.log("User", user);
      
      const result = await this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
      this.navCtrl.pop();  
      const alert = await this.alertController.create({
        message: '<h1 style="text-align:center">Registro exitoso! </h1>'
      });
    
      await alert.present();
      console.log("Registro exitoso");
    
    } catch (err) {
      const alert = await this.alertController.create({
        message: '<h1 style="text-align:center">error en el registro  </h1>'
      });
    
      await alert.present();
      console.log("error en el registro");
      
    }
  }

}
