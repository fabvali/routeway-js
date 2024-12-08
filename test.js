const { Client } = require('./lib/index');

const client = new Client("sk-d4XjHpGRIELrCFJDScSpYeZM4OMag13XHfe8eqM8aU7EG7vQ");
const response = await client.chat.completions.create([
    {
        role: "user",
        content: "Hallo, Wie gehts?"
    }
]);

console.log(response.choices);