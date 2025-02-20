

const userInput = '<script>alert("XSS vulnerability");</script>';
const message = `Hello, ${userInput}!`;
document.getElementById('output').innerHTML = message;


const insecureRandom = Math.random();
console.log(`Insecure random number: ${insecureRandom}`);

const code = `console.log("Executing arbitrary code!");`;
eval(code);
