# ekki-backend
MVP - Bank Accounts

### Pré-requisitos
* node (desenvolvido na v8.9.4)
* knex
* nodemon

### Criar ambiente
git clone https://github.com/campanel/ekki-backend.git

cd [ekki-backend]

npm install knex -g

npm install -g nodemon

npm install

### Criar Banco no Mysql
mysql> create database myapp;

### Configurar credencias do Banco de Dados
cp .env.example .env

editar .env com os dados do seu mysql

### Criar Tabelas
knex migrate:latest

### Popular Banco de dados com dados pré-definidos em ambiente de desenv
knex seed:run

### Subir aplicação em desenv
nodemon index.js

http://localhost:3000/api/users

### test
npm run test