import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import express from 'express';

async function is_valid_signature(message, signature) {
    const signature_verify_response = await fetch("https://blisache.com/api/signature/verify", {
        method: "POST",
        body: JSON.stringify({
            message: Array.from(new Uint8Array(message)),
            signature: Array.from(new Uint8Array(signature))
        }),
        headers: {
            "Content-type": "application/json",
        },
    });
    const data = await signature_verify_response.json();

    return data.result == "Success";
}

const register_html = readFileSync('./public/html/register.html', 'utf8');
const register_success_html = readFileSync('./public/html/register_success.html', 'utf8');
const register_fail_html = readFileSync('./public/html/register_fail.html', 'utf8');
const authenticate_html = readFileSync('./public/html/authenticate.html', 'utf8');
const authenticate_success_html = readFileSync('./public/html/authenticate_success.html', 'utf8');
const authenticate_fail_html = readFileSync('./public/html/authenticate_fail.html', 'utf8');

const users = [];

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.send(register_html);
});

app.post('/register', async (req, res) => {
    console.log("POST /register");
    console.log(req.body);

    const message = Buffer.from(req.body.blisache_message, "base64");
    const signature = Buffer.from(req.body.blisache_signature, "base64");

    if (await is_valid_signature(message, signature)) {
        const blisache_registration_result = JSON.parse(message);
        console.log("response from blisache :");
        console.log(blisache_registration_result);

        if (
            blisache_registration_result.action == "RegisterComplete"
            && blisache_registration_result.result == "Success"
            // Don't forget to also check the timestamp
        ) {
            users.push(
                {
                    name: req.body.name,
                    email: req.body.email,
                    blisache_id: blisache_registration_result.data.user_id
                }
            );
            res.set('Content-Type', 'text/html');
            res.send(register_success_html);
        } else {
            res.set('Content-Type', 'text/html');
            res.send(register_fail_html);
        }
    } else {
        console.log("signature is invalid");
        res.set('Content-Type', 'text/html');
        res.send(register_fail_html);
    }
});

app.get('/authenticate', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.send(authenticate_html);
});

app.post('/authenticate', async (req, res) => {
    console.log("POST /authenticate");
    console.log(req.body);

    const message = Buffer.from(req.body.blisache_message, "base64");
    const signature = Buffer.from(req.body.blisache_signature, "base64");

    if (await is_valid_signature(message, signature)) {
        const blisache_authentication_result = JSON.parse(message);
        console.log("response from blisache :");
        console.log(blisache_authentication_result);

        if (
            blisache_authentication_result.action == "AuthenticateComplete"
            && blisache_authentication_result.result == "Success"
            // Don't forget to also check the timestamp
        ) {
            const user = users.find((element) => element.blisache_id === blisache_authentication_result.data.user_id);

            if (user) {
                console.log("user authenticated :");
                console.log(user);

                res.set('Content-Type', 'text/html');
                res.send(authenticate_success_html);
            } else {
                console.log("unknown user");
                res.set('Content-Type', 'text/html');
                res.send(authenticate_fail_html);
            }
        } else {
            res.set('Content-Type', 'text/html');
            res.send(authenticate_fail_html);
        }
    } else {
        console.log("signature is invalid");
        res.set('Content-Type', 'text/html');
        res.send(authenticate_fail_html);
    }
});

app.listen(3000, '127.0.0.1', () => {
    console.log('Listening on 127.0.0.1:3000');
});
