
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const json2xls = require('json2xls');
const { v4: uuidv4 } = require('uuid');
const { zonedTimeToUtc } = require('date-fns-tz');

const app = express();

app.listen(process.env.PORT || 3334, ()=>{

  function logs() {
    const pathLogs= path.join(__dirname, 'files','logs','downloads.json');

      fs.stat(pathLogs, function(err, stat) {
        if(err == null) {
        
          fs.readFile(pathLogs, (err, logs) => {
            if (err) throw err;
            let ObjLogs = JSON.parse(logs);

            var newLog = {
              id: uuidv4(),
              Data: zonedTimeToUtc(new Date(), 'America/Sao_Paulo'),
            };
            ObjLogs.push(newLog)
            ObjLogs = JSON.stringify(ObjLogs);
            fs.writeFileSync(pathLogs, ObjLogs);
          });



        } else if(err.code === 'ENOENT') {

          var newLog = [{
            id: uuidv4(),
            Data: zonedTimeToUtc(new Date(), 'America/Sao_Paulo'),
          }];
          newLog = JSON.stringify(newLog);
          fs.writeFileSync(pathLogs, newLog);

        } else {
            console.log('Some other error: ', err.code);
        }
      });
  }


  function load_file() {

    const url = 'https://painel.covid19br.org/assets/dataset-web/dataMun.json';
    const settings = { method: "Get" };

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            
            const salvador = json.filter( cidade => {
              return cidade.state === 'BA' && cidade.city === 'Salvador/BA';
            });

            const data = JSON.stringify(salvador);
            const xls = json2xls(salvador);

            const pathJson = path.join(__dirname, 'files','json','Salvador.json');
            const pathXlsx = path.join(__dirname, 'files','xlsx','Salvador.xlsx');

            fs.writeFileSync(pathJson, data);
            fs.writeFileSync(pathXlsx, xls, 'binary', (err) => {
              if (err) { console.log("writeFileSync :", err);}
            });
            logs();
          
        });

  }
  

  function clock() {

    const diasx = [1,2,3,4,5,6,7];
    const dias  = ['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Domingo'];

    const data = new Date();
    const dia = data.getDay();	 
    const horas = data.getHours();
    const minutos = data.getMinutes();
    const minutos_real = data.getMinutes();
    const real_minutos = data.getMinutes();
    const segundos = data.getSeconds();
    
    // Dia em string;
    const dia_str = dias[dia-1]; 

    if(horas === 7 && minutos === 0 && segundos === 0) {
      console.log(`Dia [${dia_str}],  Horas [${horas}], Minutos [${minutos}], Segundos [${segundos}]`);
      load_file();
    }

  }

  setInterval(clock,1000);

});




    