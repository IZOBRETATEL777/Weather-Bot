

const userInput = '<script>alert("XSS vulnerability");</script>';
const message = `Hello, ${userInput}!`;
document.getElementById('output').innerHTML = message;


const insecureRandom = Math.random();
console.log(`Insecure random number: ${insecureRandom}`);

const code = `console.log("Executing arbitrary code!");`;
eval(code);


import { executeQuery } from 'database';

const userId = '1; DROP TABLE users;';
const query = `SELECT * FROM users WHERE id = ${userId}`;
executeQuery(query);
