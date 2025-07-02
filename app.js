const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const bodyParser = require('body-parser');
// app.use(bodyParser.json());
app.use(express.json());

let connection;(async () => {
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Shafquat@235',
      database: 'todo_app'
    });
    console.log('CONNECTED!!');
  } catch (err) {
    console.error('Connection error:', err);
  }
})();

app.get("/fetch",async(req,res)=>{
  try{

    const [rows] =await connection.query("select * from service_providers");
      res.json(rows);
  }catch(err){
    console.error(err);
    res.status(500).send('Error fetching users');
  }
    
      // console.log(JSON.parse(JSON.stringify(result)));
  
});


app.get("/fetchbyid/:id",async(req,res)=>{
    try{
      
      const fetchid=[req.params.id];
      const [rows]=await connection.query("select * from service_providers  where id=?",fetchid
      );
      // if(fetchid!=rows){
      //   res.send("Id not Available");
      // }
          
      res.json(rows[0]);
    }catch(err){
      console.error(err);
    res.status(500).send('Error fetchingbyid users');
    }
  }
  

);





app.post("/register",async(req,res)=>{
  const{name, email, password, phone}=req.body;
  console.log("Request Body:", req.body); 

  try{
    if (!password) {
      return res.status(400).send("Password is missing");
    }

    const passwordHash =await bcrypt.hash(password.toString(),10);
    const [result] = await connection.query(
      //query sql
      'INSERT INTO service_providers (name, email,password_hash,phone)VALUES(?, ?, ?, ?)',
  
  
      [name, email, passwordHash, phone]
    );
  res.status(201).send('succefully register');
  }catch(err){
    console.error(err);
    res.status(500).send('unsuccesfully');
  }

});



app.get("/",(req,res)=>{
res.send("succesfully");
});


app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});