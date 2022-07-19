/// <reference types="cypress" />
const { defineConfig } = require('cypress')
const humanizeDuration = require("humanize-duration")
const fs = require("fs")

let resultados = ""
let totais = ""
let allResults
let num_specs = 0
let total_specs 
//criando pasta log e arquivo para registrar dados [na minha versao 9.7 o console.log nao exibia o terminal]
//utilizado com o file  append
let data_arquivo = new Date().toLocaleDateString()
let nomeArquivo = "cypress/log/log[" + data_arquivo.replace(/\//g,  "-") + "] index.txt"

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      console.log("======================= ENTROU NO NODE-EVENT  ============================")
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
          //verifica conexao
          transport.verify(function (error, success) {
            let hoje = new Date().toLocaleString()
            if (error) {
              data = "[" + hoje + "] nao passou na conexao \n" + error + "\n"
            } else {
              data ="[" + hoje + "]  passou na conexao " +  + success + " \n"
            }
            console.log(data)
            fs.appendFile(nomeArquivo, data, (err) => {})
          })

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
          
          var testResults = Object.keys(allResults).map(spec => {
            
            console.log('\n' + spec +  '\n' + dashes(spec) + '\n' )
            var specResults = allResults[spec]

            return (
              spec +  '<br>' + dashes(spec) + '<br>' 
              + Object.keys(specResults).map((testName) => {
                  var testStatus = specResults[testName]
                  var testCharacter = getStatusEmoji(testStatus)
                  return testCharacter  + ' ' + testName
                }).join('<br>')
            )
          }).join('<br> fim test_result ---- ')


          //const dashboard = afterRun.runUrl ? 'Run url: ${afterRun.runUrl}\n' : ''
          
          let message = {
            from: config.env.FROM,

            // lista de destinatarios separa por virgula
            to: config.env.EMAIL_TO,

            // Assunto da mensagem
            subject: "[" + hoje + "] Relatorio de Resultados",

            // a escolha de qual corpo será utilizado, depende da configuração do email
            // corpo do email em plaintext 
            text: 'Texto puro:\n\n' + testResults + '\n' ,

            // corpo do email em HTML 
            html:
              "<p><b>Resultados dos Testes</b> - Executados em " + hoje +
              "<br><img src='cid:teste'/></p>"   +
              "<p>Resultados por arquivo de testes:</p>" +  
              "<br>" + testResults + "<br>" +
              "<br>duration " + humanizeDuration(totais.duracao)
            ,
            attachment: [{
              filename: 'favicon-color.png',
              path:   __dirname  + '../public/imgs/favicon-color.png',
              cid: 'teste'
            }]
          
          }

          

          transport.sendMail(message, (erro, info) => {
            if (erro) {
              console.log("================= ERRO AO ENVIAR EMAIL ====================" + erro)
              return process.exit(1)
            }else{
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
        console.log("======================= BEFORE RUN =============================")
      })
      on('before:spec', () => {
       // allResults = {}
       
        console.log("======================= BEFORE SPEC =============================")
      })

      on('after:spec', (spec, results) => {
        console.log("======================= AFTER SPEC  ============================")
        num_specs += 1
        if(num_specs == 2){
          allResults[spec.relative] = {}
          const resposta = allResults[spec.relative]
          total_specs = Object.keys(allResults)
          
          console.log('\n' + num_specs + ' --- '  + ' --- ' +results.stats.tests)


         
          
            results.tests.forEach((tst) => {
            const testTitle = tst.title.join(' - ')
            resposta[testTitle] = tst.state
            })
            let hoje = new Date().toLocaleString()
            envia_emails(hoje)
          }
      })

      on('after:run',  async (afterRun) => {
        console.log("======================= AFTER RUN  ============================")
        num_specs += 1
        // add the totals to the results
        // explanation of test statuses in the blog post
        // https://glebbahmutov.com/blog/cypress-test-statuses/
      
        totais = {
          suites: afterRun.totalSuites,
          testes: afterRun.totalTests,
          falhos: afterRun.totalFailed,
          ok: afterRun.totalPassed,
          pendentes: afterRun.totalPending,
          pulados: afterRun.totalSkipped,
          duracao: afterRun.totalDuration,
          browser: afterRun.browserName,
        }

        resultados =  "Execucao no navegador " + totais.browser + "\nTotal de suites: " + totais.suites + 
          " \nTotal de testes: "+ totais.testes +"\n" 
          if (totais.ok > 1)
            resultados += totais.ok + " testes passaram, "
          if (totais.ok == 1)
            resultados += totais.ok + " teste passou, "
          if (totais.ok == 0)
            resultados +=   " nenhum teste passou, " 
          if (totais.falhos > 1)
            resultados += totais.falhos + " testes falharam, "
          if (totais.falhos == 1)
            resultados += totais.falhos + " teste falhou, "
          if (totais.falhos == 0)
            resultados +=   " nenhum teste falhou, " 
          if (totais.pendentes > 1)
            resultados += totais.pendentes + " testes ficaram pendentes, "
          if (totais.pendentes == 1)
            resultados += totais.pendentes + " teste ficou pendente, "
          if (totais.pendentes == 0)
            resultados +=   " nenhum teste ficou pendente, " 
          if (totais.pulados > 1)
            resultados += totais.pulados + " testes foram pulados"
          if (totais.pulados == 1)
            resultados += totais.pulados + " teste foi pulado "
          if (totais.pulados == 0)
            resultados +=   " nenhum teste foi pulado " 
        
        resultados += " \nTestes executados em " + humanizeDuration(totais.duracao)
        
        console.log(resultados)
        
        
      })
        
      
      on("task", {
        log(message) {
          console.log(message)
          return null
        }
      })
    },
    env: { 
      "HOST": "smtp.gmail.com",
      "PORT": "587",
      "FROM": "Luciano <luciano.testesqa@gmail.com>",
      "USER": "luciano.testesqa@gmail.com",
      "PASSWORD": "oitzqgwhcszamkpy",
      "TESTEQA": "valor",
      "EMAIL_TO": ["rufusQA@pm.me","luciano.testesqa@gmail.com","luciano.santosgoncalves@rufustec.com"]
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