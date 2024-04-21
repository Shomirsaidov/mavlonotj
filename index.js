const Hapi = require('@hapi/hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwaggered = require('hapi-swaggered');
const HapiSwaggeredUI = require('hapi-swaggered-ui');
const JwtAuth = require('hapi-auth-jwt2');
const knex = require('knex');
const knexConfig = require('./knexfile').development;
const knexInstance = knex(knexConfig);
require('dotenv').config(); 
const nodemailer = require('nodemailer')

const validate = async (decodedToken, request) => {
  try {
      console.log(decodedToken)
      const user = await knexInstance('users')
          .where({ name: decodedToken.name })
          .first();

      if (!user) {
          return { isValid: false };
      }

      const isAuthorized = true;

      return { isValid: isAuthorized, credentials: decodedToken };
  } catch (error) {
      console.error('Error validating token:', error);
      return { isValid: false };
  }
};


const init = async () => {
    const server = Hapi.Server({
        port: 4545,
        host: 'localhost',
        "routes": {
            "cors": {
                "origin": ["*"],
                "headers": ["Accept", "Content-Type"],
                "additionalHeaders": ["X-Requested-With"]
            }
        }
    });

    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response.isBoom) {
            // Error response, add CORS headers
            response.output.headers['Access-Control-Allow-Origin'] = '*';
            response.output.headers['Access-Control-Allow-Header'] = '*';
        } else {
            // Non-error response, add CORS headers
            response.headers['Access-Control-Allow-Origin'] = '*';
            response.headers['Access-Control-Allow-Headers'] = '*';
        }
        return h.continue;
    });

    await server.register([
      require('./poems/create'),
      require('./poems/read'), 
      require('./poems/delete'),
      require('./poems/update'),
      require('./auth/register'),
      require('./auth/login')
    ]);

    await server.register([
        JwtAuth,
        Inert,
        Vision,
        {
            plugin: HapiSwaggered,
            options: {
                info: {
                    title: 'Mavlono.tj API documentation',
                    version: '1.0.0',
                },
                auth: false
            },
        },
        {
            plugin: HapiSwaggeredUI,
            options: {
                title: 'Swagger UI',
                path: '/docs',
                auth: false
            },
        },
    ]);

    server.auth.strategy('jwt', 'jwt', {
        key: process.env.JWT_SECRET,
        validate,
        verifyOptions: { algorithms: ['HS256'] }
    });

    server.auth.default('jwt')

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
         user: 'mavlonotjcompany@gmail.com',
         pass: 'fcsv xcfs zfrj yecx',
        },
    });

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: async(request, h) => {
                // const headers = request.headers;
                // console.log('Request Headers:', headers);
                // return request.auth.credentials.role;

                // const { to, subject, text } = request.payload;

                // Create email options
                const mailOptions = {
                    from: 'mavlonotjcompany@gmail.com',
                    to: "shomirsaidov.abubakr@mail.ru",
                    subject: "Мавлоно Балхи - Дило дар назди касе биншин",
                    html: `
                        <em>
                            <p>Дило дар назди касе биншин ки у аз дил хабар дорад</p>
                            <p>Ба зери он дарахте рав, ки ў гулҳои тар дорад.</p>
                            <p>Дар ин бозори атторон, марав ҳар сў чу бекорон,</p>
                            <p>Ба дукони касе биншин, ки дар дукон шакар дорад.</p>
                            <p>Ба ҳар деге, ки меҷўшад маёвар косаву маншин,</p>
                            <p>Ки ҳар деге, ки меҷўшад, дарун чизи дигар дорад.</p>
                            <p>Бинол, эй булбули дастон, ба зери нолаи мастон,</p>
                        </em>
                        <center>
                            <p><a href="https://mavlono.tj/poem/344"><button style="padding: 15px; background: linear-gradient(royalblue, blueviolet); color: white; font-weight: bold; font-size: 22px; border-radius: 30px;">Хондани пурра</button></a></p>
                        </center>    
                        `
                };

                try {
                    const info = await transporter.sendMail(mailOptions);
                    console.log('Email sent: ' + info.response);
                    return { success: true, message: 'Email sent successfully' };
                } catch (error) {
                    console.error('Error sending email:', error);
                    return { success: false, message: 'Failed to send email' };
                }



            },
            options: {
                auth: false
            }
        }
    ]);

    await server.start();
    console.log('Server started on port 4545!');
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
