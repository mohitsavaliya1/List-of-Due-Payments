let nodemailer = require('nodemailer');
let Sequelize = require('sequelize');
let models = require('../models');
let fs = require('fs');
let moment = require('moment');

let today  = moment().format("MMM Do YY");
let hostname = 'Pranam_Enterprise';
let connectionInfo = {};

// mysql connection.
if(!connectionInfo[hostname]){
    connectionInfo[hostname] = {
      sequelize:null,
      models:{}
    };
    
    connectionInfo[hostname].sequelize = new Sequelize(hostname.replace(/\./g,'_'),'root','root',{
      dialect:'mysql',
      port:'6000',
      host:'127.0.0.1',
      pool:{
        max:1,
        min:0,
        idle:1000
      },
      isolationLevel:Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
    });
    connectionInfo[hostname].models = models.SetupModel(connectionInfo[hostname].sequelize);

}

let models = connectionInfo[hostname].models;

let transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'mohitsavaliya33@gmail.com',
        pass: ''
    }
});

let customerAndPayments;

connectionInfo[hostname].sequelize.authenticate()
.then(()=>{
  
  models.customers.findAll({
      /*[duePayment.gt] : 1000*/
  })

  .then((customers)=>{
     for(let cust of customers){
        models.payments.findOne({
          where: {name : cust.name}
        })
        .then((payment)=>{
          let name = cust.name;
          let duePayment = cust.totalPayment - payment;
          customersAndPayments.push(name);
          customersAndPayments[name].push(duePayment);    
        })
        .catch((err)=>{
          console.error(err);
       })            
     }
  })

  .catch((err)=>{
    console.error(err);
  })

});

let file = fs.createWriteStream('/home/admin/Desktop/duePayments.txt');
file.on('error', (err)=> {
    console.log(err);
});

customerAndPayments.forEach((v)=> { file.write(v + '\n'); });

file.end();

const mailOptions = {
  from: 'mohitsavaliya33@gmail.com', // sender address
  to: '@gmail.com', // list of receivers
  subject: `due payments till ${today}`, // Subject line
  html: '<p>DuePayments Are In Attached File</p>',// plain text body
  attachments: 
        {   // filename and content type is derived from path
            path: '/home/admin/Desktop/duePayments.txt'
        } 
    
};

transporter.sendMail(mailOptions, function (err, info) {
   if(err)
     console.log(err);
   else
     console.log(info);
});
