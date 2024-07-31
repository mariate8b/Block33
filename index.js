const express = require('express');
const pg = require('pg');
const morgan = require('morgan');

const port = 3000;

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory');

const server = express();

const init = async () => {
  try {
    await client.connect();
    console.log('client connected');

    let SQL = `
      DROP TABLE IF EXISTS employees;
      DROP TABLE IF EXISTS departments;

      CREATE TABLE departments(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );

      CREATE TABLE employees(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        department_id INTEGER,
        CONSTRAINT fk_department
          FOREIGN KEY(department_id) 
          REFERENCES departments(id)
      );
    `;
    await client.query(SQL);
    console.log("tables created");

    SQL = `
      INSERT INTO departments (name) VALUES
      ('Engineering'),
      ('Marketing'),
      ('Sales');

      INSERT INTO employees (name, department_id)
      VALUES 
      ('John Doe', (SELECT id FROM departments WHERE name = 'Engineering')),
      ('Jane Smith', (SELECT id FROM departments WHERE name = 'Marketing')),
      ('Emily Johnson', (SELECT id FROM departments WHERE name = 'Sales'));
    `;
    await client.query(SQL);
    console.log("seeded tables");

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
};

init();

server.use(express.json());
server.use(morgan("dev"));

server.get('/api/employees', async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM employees;`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

server.get('/api/departments', async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM departments;`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

server.post('/api/employees', async (req, res, next) => {
  try {
    const { name, department_id } = req.body;
    const SQL = `INSERT INTO employees (name, department_id) VALUES ($1, $2) RETURNING *;`;
    const response = await client.query(SQL, [name, department_id]);
    res.status(201).send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

server.delete('/api/employees/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const SQL = `DELETE FROM employees WHERE id = $1;`;
    await client.query(SQL, [id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

server.put('/api/employees/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, department_id } = req.body;
    const SQL = `UPDATE employees SET name = $1, department_id = $2, updated_at = now() WHERE id = $3 RETURNING *;`;
    const response = await client.query(SQL, [name, department_id, id]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

server.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message });
});