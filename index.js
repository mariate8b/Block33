const express = require('express')
const pg = require('pg');
const port = 3000;


const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory');

const server = express()

const init = async() =>{
 await client.connect();
 console.log('client connected');

 let SQL =`
 DROP TABLE IF EXISTS employees;
 DROP TABLE IF EXISTS deparment;

 CREATE TABLE department(
 id SERIAL PRIMARY KEY 
 name VARCHAR(255) NOT NULL
 );

 CREATE TABLE employees(
 id SERIAL PRIMARY KEY
 name VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  department_id INTEGER,
  CONSTRAINT fk_department
    FOREIGN KEY(department_id) 
	  REFERENCES Department(id)
 );
`;
await client.query(SQL);
console.log("tables created");

SQL= `
INSERT INTO departments (name) VALUES
('Engineering'),
('Marketing'),
('Sales');

INSERT INTO employees (txt, ranking, department_id)
VALUES ('create tables', 18, (SELECT id FROM departments WHERE name = 'Engineering'));

INSERT INTO employees (txt, ranking, department_id)
VALUES ('create tables', 5, (SELECT id FROM departments WHERE name = 'Marketing'));

INSERT INTO employees (txt, ranking, department_id)
VALUES ('create tables', 187, (SELECT id FROM departments WHERE name = 'Sales'));

`
await client.query(SQL);
console.log("seeded tables");

const PORT = process.env.PORT || 3000;
server.listen(PORT,() => {
console.log(`Server listening on port ${PORT}`);
});
};

init()