import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { PersonaItem } from '../../models/persona-item/persona-item';
import { ActividadItem } from '../../models/actividad_fisica/actividad_fisica';
import { ConfigServiceProvider } from '../../providers/config-service/config-service';

/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  // data base objects
  actividad_fisica = {} as ActividadItem;
  refActividad: any;
  persona = {} as PersonaItem;
  refPersona: any;
  login: any;

  personas = [];
  actividades = [];

  relationed = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public database: AngularFireDatabase, public configService: ConfigServiceProvider) {
    if(this.navParams.data["login"])
      this.login = this.navParams.data["login"];
    this.refPersona = database.object("Usuario_mobil");
    this.refActividad = this.database.list("Atividad_fisica");

    this.loadInfo();
  }

  async loadInfo() {
    try {
      this.configService.showLoader("Cargando");
      let usersRef = this.database.database.ref("Usuario_mobil");
      usersRef.orderByChild('cedula').once("value").then(snapshot => {
        snapshot.forEach(element => {
          let item = {
            key: element.key,
            value: element.val()
          }
          this.personas.push(item);
        });
        console.log("value", this.personas);
        let activityRef = this.database.database.ref("Atividad_fisica");
        activityRef.once("value").then(snapshot => {
          snapshot.forEach(element => {
            let item = {
              key: element.key,
              value: element.val()
            }
            this.actividades.push(item);
          });
          console.log("value", this.actividades);
          this.configService.dismissAllLoaders();
          this.dataRelation();
        });
      });
    } catch (err) {
      console.log("loadInfo() error>", err);
    }
  }


  dataRelation() {
    for (let elem of this.actividades) {
      if (!elem.value.cedula) {
        let person = this.getUsrByKey(elem.value.persona);
        elem.value.persona = person;
      }
    }
    this.relationed = true;
    console.log("ACTIVIDADES---",this.actividades)
  }

  getUsrByKey(key) {
    for (let elem of this.personas) {
      if (elem.key == key)
        return elem.value;
    }
    return 0;
  }

}
