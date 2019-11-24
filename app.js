const express = require("express");
const mysql   = require("mysql");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js

//routes
app.get("/", async function(req, res){

  let categories = await getCategories();
  //console.log(categories);
  res.render("index", {"categories":categories});

});//root

app.get("/quotes", async function(req, res){

  let rows = await getQuotes(req.query);
  res.render("quotes", {"records":rows});

});//quotes

app.get("/authorInfo", async function(req, res){
    
   let rows = await getAuthorInfo(req.query.authorId);
  //res.render("quotes", {"records":rows});
    res.send(rows)
});//quotes

function getAuthorInfo(authorId){
    let conn = dbConnection();
    
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                      FROM q_author
                      WHERE authorId = ${authorId}`;
            console.log(sql);        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
    
}
function getQuotes(query){
    
    let keyword = query.keyword;
    let authorfirst = query.authorfirst;
    let authorlast = query.authorlast;
    let gender = query.gender;
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let params = [];
        
           let sql = `SELECT quote, firstName, lastName, category, sex, authorId FROM q_quotes
                      NATURAL JOIN q_author
                      WHERE 
                      quote LIKE '%${keyword}%'
                      AND firstName LIKE '%${authorfirst}%'
                      AND lastName LIKE '%${authorlast}%'
                      AND sex LIKE '%${gender}%'`;
        
           if (query.category) { //user selected a category
              sql += " AND category = ?"; //To prevent SQL injection, SQL statement shouldn't have any quotes.
           }
           params.push(query.category); 
           if (query.authorfirst){
                
                sql += ` AND firstName LIKE '%${authorfirst}%'`
            }
            params.push(query.authorfirst);
            if (query.authorlast){
                
                sql += ` AND lastName LIKE '%${authorlast}%'`;
            }
            params.push(query.authorlast); 
            if (query.gender){
                
                sql += ` AND sex = '${gender}'`;
            }
            params.push(query.gender); 
        
           console.log("SQL:", sql)
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
    
}//getQuotes


function getCategories(){
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT DISTINCT category 
                      FROM q_quotes
                      ORDER BY category`;
        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
    
}//getCategories

app.get("/dbTest", function(req, res){

    let conn = dbConnection();
    
    conn.connect(function(err) {
       if (err) throw err;
       console.log("Connected!");
    
       let sql = "SELECT * FROM q_author WHERE sex = 'F'";
    
       conn.query(sql, function (err, rows, fields) {
          if (err) throw err;
          conn.end();
          res.send(rows);
       });
    
    });

});//dbTest

//values in red must be updated
function dbConnection(){

   let conn = mysql.createConnection({
                 host: "cst336db.space",
                 user: "cst336_dbUser",
             password: "secret19",
             database: "cst336_db"
       }); //createConnection

return conn;

}

//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});