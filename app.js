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

//login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await connection.query(
    "SELECT * FROM service_providers WHERE email = ?", [email]
  );
  if (rows.length === 0) return res.status(404).send("User not found");

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).send("Wrong password");

  res.json({ user_id: user.id, name: user.name }); // or send JWT later
});

//signup
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

//  Add Todo
app.post('/todos', async (req, res) => {
  const { user_id, task } = req.body;
  await connection.query("INSERT INTO todo (user_id, task) VALUES (?, ?)", [user_id, task]);
  res.send("Todo added");
});

//  Get All Todos for a User
app.get('/todos/:user_id', async (req, res) => {
  const [rows] = await connection.query("SELECT * FROM todos WHERE user_name = ?", [req.params.user_name]);
  res.json(rows);
});

//  Update Todo
app.put('/todos/:id', async (req, res) => {
  const { task, completed } = req.body;
  await connection.query(
    "UPDATE todos SET task = ?, completed = ? WHERE id = ?",
    [task, completed, req.params.id]
  );
  res.send("Todo updated");
});


//delete
app.delete('/todos/:id', async (req, res) => {
  await connection.query("DELETE FROM todos WHERE id = ?", [req.params.id]);
  res.send("Todo deleted");
});


//all data detail
app.get('/users/:id/details', async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await connection.query(`
      SELECT
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.password_hash,
        u.created_at AS user_created,
        u.update_at AS user_updated,
        t.id AS todo_id,
        t.task,
        t.completed,
        t.created_at AS task_created,
        t.updated_at AS task_updated,
        t.is_deleted
      FROM service_providers u
      LEFT JOIN todo t ON u.id = t.user_id
      WHERE u.id = ?
      ORDER BY t.id;
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});




app.get("/",(req,res)=>{
res.send("succesfully");
});


app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});