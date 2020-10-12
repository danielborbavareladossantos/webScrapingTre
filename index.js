require('geckodriver');
require('chromedriver');
const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require('fs');
const fetch = require('node-fetch');
let url = "https://maps.googleapis.com/maps/api/geocode/json";
 
(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {

    var listaTitles = [];
    var listaDados = [];
    
    //faz carregamento da pagina
    await driver.get('http://apps.tre-sc.jus.br/site/fileadmin/arquivos/eleicoes/estatistica_eleitoral/estat_offline/LocaisVotacao/MunicLocaisVotacao/MunicLocaisVotacao80470.htm');
    await driver.wait(until.titleIs('Locais de Votação'), 1000);

    let cssComponents = '.appDataTable';
    let componenets = await driver.wait(until.elementLocated(By.css(cssComponents)), 10000).findElements(By.tagName("tr"));
    
    // for (let i = 0; i < 2; i++) {
    for (let i = 0; i < componenets.length; i++) {

      let linhaTitle = await componenets[i].findElements(By.css("th"));
      if (linhaTitle!=null&&linhaTitle[0]!=null) {
        for (let i = 0; i < linhaTitle.length; i++) {
          let campo = await linhaTitle[i].getText();
          listaTitles.push(campo);
        }
      }

      let linha = await componenets[i].findElements(By.css("td"));
      if (linha!=null&&linha[0]!=null) {
        let campo0 = await linha[0].getText();
        let campo1 = await linha[1].getText();
        let campo2 = await linha[2].getText();
        let campo3 = await linha[3].getText();
        let campo4 = await linha[4].getText();
        let campo5 = await linha[5].getText();
        let campo6 = await linha[6].getText();

        let address = "?address="+encodeURIComponent("BLUMENAU SC "+campo3);
        let key = "&key=KEYGOOGLE";
        let settings = { method: "Get" };

        const response = await fetch(url+address+key, settings);
        const location = await response.json();
        
        var campo7 = null;
        if (location && location.results && location.results[0].geometry && location.results[0].geometry.location) {
          campo7 = location.results[0].geometry.location;
        }

        let data = [
          {
            key: listaTitles[0],
            value: campo0
          },
          {
            key: listaTitles[1],
            value: campo1
          },
          {
            key: listaTitles[2],
            value: campo2
          },
          {
            key: listaTitles[3],
            value: campo3
          },
          {
            key: listaTitles[4],
            value: campo4
          },
          {
            key: listaTitles[5],
            value: campo5
          },
          {
            key: listaTitles[6],
            value: eval(campo6)
          },
          {
            key: 'geo',
            value: campo7
          },
        ];
        listaDados.push(data);
      }
      
    }

    fs.writeFile('eleitores.json', JSON.stringify(listaDados), (err) => {
      if (err) throw err;
      console.log('Arquivo criado!');
    }); 

  } finally {
    await driver.quit();
  }
})();