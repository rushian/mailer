/// <reference types="cypress" />
const { defineConfig } = require('cypress')
const AllureWriter = require("@shelex/cypress-allure-plugin/writer");

let allResults 
let num_specs 

var variavel = {
  valor: 0,
  get int() { // define o get integer
    return this.valor;
  },  
  set int(i) {  // define o set
  	this.valor = i;
  }
}

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      AllureWriter(on, config);
      envia_emails = function (hoje) {
          console.log("======================= ENTROU NA ENVIA-EMAILS  ============================")
          //instanciar nodemailer
          var nodemailer = require("nodemailer")
          // criar objeto de transporte reutilizavel usando o transport SMTP default
          // quando há autenticacao de 2 fatores no email a pagina https://myaccount.google.com/apppasswords
          // permite configurar o token de acesso gmail com 16 digitos
          var transport = nodemailer.createTransport(
            {
              host: config.env.HOST,
              port: Number(config.env.PORT),
              secure: false, // true for 465, false for other ports
              auth: {
                user: config.env.USER, 
                pass: config.env.PASSWORD
              },
              logger: true,
              transactionLog: true
            }
          )
          
          function dashes(s) {
            return '-'.repeat(s.length)
          }
        
          function getStatusEmoji(status) {
            console.log('========= STATUS ==========\n' + status)
          
            // https://glebbahmutov.com/blog/cypress-test-statuses/
            const validStatuses = ['passed', 'failed', 'pending', 'skipped']
            if (!validStatuses.includes(status)) {

              throw new Error('Invalid status: "${status}"')
            }
          
            const emoji = {
              passed: '✅',
              failed: '❌',
              pending: '⌛',
              skipped: '⚠️',
            }
            return emoji[status]
          }
          
          
          variavel.int = Object.keys(allResults).length

          var testResults = Object.keys(allResults).map(spec => {
            var specResults = allResults[spec]
            
            return (
              spec +  '<br>' + dashes(spec) + '<br>' 
              + Object.keys(specResults).map((testName) => {
                  var testStatus = specResults[testName]
                  var testCharacter = getStatusEmoji(testStatus)
                  return testCharacter  + ' ' + testName
                }).join('<br>')
            )
          }).join('<br>')
          
          let message = {
            //remetente Nome <email>
            from: config.env.FROM,
            // lista de destinatarios separa por virgula
            to: config.env.EMAIL_TO,
            // Assunto da mensagem
            subject: "[" + hoje + "]("+num_specs+") Relatorio de Resultados",

            // a escolha de qual corpo será utilizado, depende da configuração do email
            // corpo do email em plaintext 
            text: 'Texto puro:\n\n' + testResults + '\n' ,
            // corpo do email em HTML 
            html:
              "<p><b>Resultados dos Testes</b> - Executados em " + hoje +
              "<br><img src='cid:teste'></p>"   +
              "<p>Resultados por arquivo de testes:</p>" +  
              "<br>" + testResults + "<br>"
            ,
            attachment: [{
              filename: 'favicon-color.png',
              path:    '../public/imgs/favicon-color.png',
              cid: 'teste'
            }]
          
          }

          transport.sendMail(message, (erro, info) => {

            console.log('========= ENTROU NO TRANSPORT.SENDMAIL ==========\n' + info)
            if (erro) {
              console.log("================= ERRO AO ENVIAR EMAIL ====================\n" + erro)
              return process.exit(1)
            } else {
              console.log("================= ENVIO SEM ERROS ====================")
            }
            transport.close()
          })
        }
      /*
        os comandos before:run; after:spec e after:run sao acessados ao utilizar cypress run para rodar os teste;
        conforme explicado em https://docs.cypress.io/api/plugins/after-run-api#Syntax
      */ 
      on('before:run', () => {
        allResults = {}
        num_specs = 0
        console.log("======================= BEFORE RUN =============================")
      })

      on('after:spec', (spec, results) => {
        console.log("======================= AFTER SPEC  ============================")
        num_specs += 1
        console.log(num_specs)
        console.log(variavel.int)

        allResults[spec.relative] = {}
        const resposta = allResults[spec.relative]
        total_specs = Object.keys(allResults)
        results.tests.forEach((tst) => {
          const testTitle = tst.title.join(' - ')
          resposta[testTitle] = tst.state
        })
        if(num_specs == 2) {
          let hoje = new Date().toLocaleString()
          envia_emails(hoje)
        }
      })
        
      
      on("task", {
        log(message) {
          console.log(message)
          return null
        }
      })
    },
    env: { 
      allureResultsPath: "./allure-results",
      "HOST": "smtp.gmail.com",
      "PORT": "587",
      "FROM": "Luciano <luciano.testesqa@gmail.com>",
      "USER": "luciano.testesqa@gmail.com",
      "PASSWORD": "oitzqgwhcszamkpy",
      "EMAIL_TO": ["jeferson.shandler@rufustec.com","luciano.ivec@gmail.com"]
      }
    },
    component: {
    specPattern: 'src/**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}',
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    }
  }
})