const express = require('express')
const pg = require('pg');


const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory')

const init = async() =>{
 await client.connect();
 console.log('client connected');

 let SQL =`
 DROP TABLE IF EXISTS employees;
 DROP TABLE IF EXISTS categories;

 CREATE TABLE Department(
 id SERIAL PRIMARY KEY 
 name VARCHAR(255) NOT NULL
 );

 CREATE TABLE Employee(
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

}

init()