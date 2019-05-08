import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { PersonaItem } from '../../models/persona-item/persona-item';
import { ActividadItem } from '../../models/actividad_fisica/actividad_fisica';
import { ConfigServiceProvider } from '../../providers/config-service/config-service';
import * as XLSX from 'xlsx';
import { File } from '@ionic-native/file/ngx';
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
  excel = [];

  relationed = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public database: AngularFireDatabase, public configService: ConfigServiceProvider,
    public file: File) {
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
          
          console.log("value", this.excel);
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
  write(): XLSX.WorkBook {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.excel);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');

    return wb;
  };
/* Export button */
async export() {
  this.excel.push(["Fecha","tiempo","Doc-id","Nombre","Edad","Genero","Facultad","Carrera","Estatura","Peso","Distancia","Pasos","Velocidad Promedio","Altitud","Tipo Actividad"])
  for (let index = 0; index < this.actividades.length; index++) {
    let json_excel =[this.actividades[index].value.Fecha,
     this.actividades[index].value.Tiempo,
     this.actividades[index].value.persona.cedula,
     this.actividades[index].value.persona.nombres+" "+ this.actividades[index].value.persona.apellidos
    ,this.actividades[index].value.persona.edad
    , this.actividades[index].value.persona.genero
    ,this.actividades[index].value.persona.facultad
    , this.actividades[index].value.persona.Carrera
    , this.actividades[index].value.persona.altura
    , this.actividades[index].value.persona.peso
    , this.actividades[index].value.distancia
    , this.actividades[index].value.pasos
    , this.actividades[index].value.velocidad
    ,this.actividades[index].value.altitud
    , this.actividades[index].value.tipo_actividad];
    this.excel.push(json_excel);
  }
  const wb: XLSX.WorkBook = this.write();
    const filename: string = "SheetJSIonic.xlsx";
      /* generate Blob */
      const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([wbout], {type: 'application/octet-stream'});

      /* find appropriate path for mobile */
      const target: string = this.file.documentsDirectory || this.file.externalDataDirectory || this.file.dataDirectory || '';
      const dentry = await this.file.resolveDirectoryUrl(target);
      const url: string = dentry.nativeURL || '';

      /* attempt to save blob to file */
      await this.file.writeFile(url, filename, blob, {replace: true});
      alert(`Wrote to SheetJSIonic.xlsx in ${url}`);

      /* in the browser, use writeFile */
      XLSX.writeFile(wb, filename);
      
 
  };

}
