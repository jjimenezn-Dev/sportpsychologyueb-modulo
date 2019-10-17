import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { PersonaItem } from '../../models/persona-item/persona-item';
import { ActividadItem } from '../../models/actividad_fisica/actividad_fisica';
import { ConfigServiceProvider } from '../../providers/config-service/config-service';
import * as XLSX from 'xlsx';
import { File } from '@ionic-native/file/ngx';
import { LoginPage } from '../login/login';

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
  actividad_list = [];
  excel = [];
  actual_page= 0;
  load_page = false;

  relationed = false;

  SelectedDate:any = new Date();

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public database: AngularFireDatabase, public configService: ConfigServiceProvider,
    public file: File,
  ) {
    if(this.navParams.data["login"])
      this.login = this.navParams.data["login"];
    this.refPersona = database.object("Usuario_mobil");
    this.refActividad = this.database.list("Atividad_fisica");

    this.loadInfo();
  }

  forceLoad(){
    this.actividades = [];
  this.actividad_list = [];
    if(this.navParams.data["login"])
      this.login = this.navParams.data["login"];
    this.refPersona = this.database.object("Usuario_mobil");
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
        let activityRef = this.database.database.ref("Atividad_fisica");
        activityRef.once("value").then(snapshot => {
          snapshot.forEach(element => {
            let item = {
              key: element.key,
              value: element.val()
            }
            this.actividades.push(item);
          });
          console.log(this.actividades);
          
          this.configService.dismissAllLoaders();
          this.dataRelation();
        });
      });
    } catch (err) {
      console.log("loadInfo() error>", err);
    }
  }


  dataRelation() {
    this.actividad_list = this.actividades;
    this.actividades = [];
    //paginar elementos cada 10
    let i = 0;
    let aux = [];
    for (let elem of this.actividad_list) {      
      if (!elem.value.cedula) {
        let person = this.getUsrByKey(elem.value.persona);
        elem.value.persona = person;
      }
      if(i < 10){
        aux.push(elem);
        i++;
      }
      else{
        this.actividades.push(aux);
        i = 0;
        aux = [];
      }
    }
    this.relationed = true;
      this.actividades.push(aux);
    
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
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.excel);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');

    return wb;
  };
  /* Export button */
  async export() {
    this.excel = [];
    for (let index = 0; index < this.actividad_list.length; index++) {
      let json_excel ={
      "Fecha" :this.actividad_list[index].value.Fecha,  
      "Genero" :this.actividad_list[index].value.persona.genero,
      "Facultad" :this.actividad_list[index].value.persona.facultad,
      "Semestre" :this.actividad_list[index].value.persona.semestre,
      "Edad" :this.actividad_list[index].value.persona.edad,
      "Nombre" :this.actividad_list[index].value.persona.nombres+" "+ this.actividad_list[index].value.persona.apellidos,
      "Documento" :this.actividad_list[index].value.persona.cedula,
      "Estatura" :this.actividad_list[index].value.persona.altura,
      "Peso" :this.actividad_list[index].value.persona.peso,
      "Masa Corporal" :this.actividad_list[index].value.persona.masaCorporal,
      "Tiempo" :this.actividad_list[index].value.Tiempo,
      "Distancia" :this.actividad_list[index].value.distancia.toFixed(3),
      "Pasos" :this.actividad_list[index].value.pasos.toFixed(0),
      "Velocidad Promedio" :this.actividad_list[index].value.velocidad.toFixed(3),
      //"Altitud" :this.actividad_list[index].value.altitud,
      "Tipo Actividad" :this.actividad_list[index].value.tipo_actividad,
      "esfuerzo" : (this.actividad_list[index].value.esfuerzo? this.actividad_list[index].value.esfuerzo : 0),
    };
      this.excel.push(json_excel);
    }
    
    const wb: XLSX.WorkBook = this.write();
    const filename: string = "datos.xlsx";
    /* generate Blob */
    const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([wbout], {type: 'application/octet-stream'});
    XLSX.writeFile(wb, filename);
  };


  before(){
    this.configService.showLoader("Cargando");
    if(this.actual_page > 0){
      this.load_page = true;
      this.actual_page--;
    }

    this.load_page = false; 
    this.configService.dismissAllLoaders();
      
  }

  after(){
    this.configService.showLoader("Cargando");
    if(this.actividades.length > 0 && this.actual_page < this.actividades.length-1){
      this.load_page = true;
      this.actual_page++;
    }

    this.load_page = false; 
    this.configService.dismissAllLoaders();
  }

  register(){
    this.navCtrl.push("RegisterPage");    
  }

  parseInt(number){
    return parseInt(number);
  }

  compareDates(){
    try {
      var date = (<HTMLInputElement>document.getElementsByClassName('dateSelector')[0]).value;
      console.log(date);
      if (date.length > 3) {
        this.actividades = [[]];
        let arr = this.actividad_list.map(function(num) {
          let selDate = new Date(date);
          selDate.setDate(selDate.getDate() + 1)
          if(num.value['Fecha'] && (selDate).getDate() === (new Date(num.value.Fecha)).getDate() && (selDate).getMonth() === (new Date(num.value.Fecha)).getMonth() && (selDate).getFullYear() === (new Date(num.value.Fecha)).getFullYear())
            return {'key': num.key , 'value': num.value};
        });
        arr.forEach(element => {
          if (element != undefined) {
            this.actividades[0].push(element)
          }
        });
      }
      
      console.log(this.actividades);
      
      
    } catch (error) {
      console.log(error, 'ups error con las fechas');
      
    }
  }

  salir(){
    this.navCtrl.setRoot('LoginPage');    
  }
}
