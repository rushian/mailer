const { defineConfig } = require('cypress')

module.exports = defineConfig({

  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {

      const envia_emails = function () {
        const fs = require("fs")
        const nodemailer = require("nodemailer")
        var hoje = new Date().toLocaleDateString()
        var nomeArquivo = "cypress/log/log[" + hoje.replace(/\//g,  "-") + "] index.txt";

        // create reusable transporter object using the default SMTP transport
        let transport = nodemailer.createTransport(
          {
            host: config.env.HOST,
            port: Number(config.env.PORT),
            secure: false, // true for 465, false for other ports
            auth: {
              user: config.env.USER, // generated ethereal user
              pass: config.env.PASSWORD, // generated ethereal password
            },
            logger: true,
            transactionLog: true
          },
          {
            from: config.env.FROM
          }
        )
    
        var data = "\n[" + hoje +  "] Criou transporte - HOST: " + config.env.HOST + " PORT: " +  config.env.PORT +
        " USER " + config.env.USER +" FROM " + config.env.FROM +" \n";
        fs.appendFile(nomeArquivo, data, (err) => {});
    
        transport.verify(function (error, success) {
          if (error) {
            var hoje = new Date().toLocaleString();
            var data = "[" + hoje + "] nao passou na conexao - erro \n";
            fs.appendFile(nomeArquivo, data, (err) => {});
          } else {
            var hoje = new Date().toLocaleString();
            var data ="[" + hoje + "]  passou na conexao - Server is ready to take our messages \n";
            fs.appendFile(nomeArquivo, data, (err) => {});
          }
        });
        var hoje = new Date().toLocaleString();
        let message = {
          // Comma separated list of recipients
          to: config.env.EMAIL_TO,
    
          // Assunto da mensagem
          subject: "[" + hoje + "] TESTE QA - envio de email",
    
          // plaintext body
          text: "Hello to myself!",
    
          // HTML body
          html:
            "<p><b>Ol&aacute;</b>, voc&ecirc; est&aacute; recebendo este email porque funcionou!!" +
            "<img src='/imgs/favicon-color.png'/></p>"  +
            "<p>Here's a nyan cat for you as an embedded attachment:<br/>" +
            "<img src='../../src/assets/chip.png'/></p>",
          
          list: {
            // List-Help: <mailto:admin@example.com?subject=help>
            help: "admin@example.com?subject=help",
    
            // List-Unsubscribe: <http://example.com> (Comment)
            unsubscribe: [
              {
                url: "http://example.com/unsubscribe",
                comment: "A short note about this url",
              },
              "unsubscribe@example.com",
            ],
    
            // List-ID: "comment" <example.com>
            id: {
              url: "mylist.example.com",
              comment: "This is my awesome list",
            }
          }
        }
        var hoje = new Date().toLocaleString();
        var data = "[" + hoje + "] " + message.to + " - destinatarios \n";
        fs.appendFile(nomeArquivo, data, (err) => {});
    
        transport.sendMail(message, (error, info) => {
          if (error) {
            var hoje = new Date().toLocaleString()
            var data = "\n[" + hoje + "]  ocorreu erro " + error.message + " \n"
            fs.appendFile(nomeArquivo, data, (err) => {})
            return process.exit(1)
          }
    
          transport.close()
        })
      }
    
        on("task", {
        enviaEmail() {
          envia_emails()
          return null
        },
        log(message) {
          console.log(message)
          return null
        },
      })
      return config
    },

    env: { 
      
      "HOST": "smtp.gmail.com",
      "PORT": "587",
      "FROM": "Luciano <luciano.testesqa@gmail.com>",
      "USER": "luciano.testesqa@gmail.com",
      "PASSWORD": "#rufus2022",
      "TESTEQA": "valor",
      "EMAIL_TO": ["luciano.ivec@gmail.com","jef_shandler@msn.com","rufusQA@pm.me","luciano.testesqa@gmail.com"]
      
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
