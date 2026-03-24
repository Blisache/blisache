import { Buffer } from 'node:buffer';
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

const users = [];

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/server/register', async (req, res) => {
    console.log("POST /server/register");
    console.log(req.body);

    const message = Buffer.from(req.body.message, "base64");
    const signature = Buffer.from(req.body.signature, "base64");

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
                    blisache_id: blisache_registration_result.data.user_id
                }
            );
            console.log("registration success");
            res.sendStatus(200)
        } else {
            console.log("registration data is invalid");
            res.sendStatus(422)
        }
    } else {
        console.log("signature is invalid");
        res.sendStatus(400)
    }
});

app.post('/server/authenticate', async (req, res) => {
    console.log("POST /server/authenticate");
    console.log(req.body);

    const message = Buffer.from(req.body.message, "base64");
    const signature = Buffer.from(req.body.signature, "base64");

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

                console.log("authentication success");
                res.sendStatus(200)
            } else {
                console.log("unknown user");
                res.sendStatus(422)
            }
        } else {
            console.log("authentication data is invalid");
            res.sendStatus(422)
        }
    } else {
        console.log("signature is invalid");
        res.sendStatus(400)
    }
});

app.listen(3000, '127.0.0.1', () => {
    console.log('Listening on 127.0.0.1:3000');
});
