import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:blisache/blisache.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final yourDomain = 'example.com';
  late final Blisache blisachePlugin;
  final registerLoginTextFieldController = TextEditingController(text: "toto@example.com");
  final registerNameTextFieldController = TextEditingController(text: "toto");
  final authenticateLoginTextFieldController = TextEditingController(text: "toto@example.com");

  @override
  void initState() {
    blisachePlugin = Blisache(domainForAll: yourDomain);
    super.initState();
  }

  @override
  void dispose() {
    registerLoginTextFieldController.dispose();
    registerNameTextFieldController.dispose();
    authenticateLoginTextFieldController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Blisache plugin example app')),
        body: Center(
          child: Column(
            children: <Widget>[
              TextField(
                controller: registerLoginTextFieldController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'login',
                )
              ),
              TextField(
                controller: registerNameTextFieldController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'name',
                )
              ),
              ElevatedButton(
                onPressed: () async {
                  final registerSignedResponse = await blisachePlugin.register(login: registerLoginTextFieldController.text, name: registerNameTextFieldController.text);
                  final registerResponse = await http.post(
                    Uri.https(yourDomain, '/server/register'),
                    headers: { "Content-Type": "application/json" },
                    body: jsonEncode(registerSignedResponse.toJson())
                  );
                  assert(registerResponse.statusCode == 200);
                  print("registered");
                },
                child: const Text('Register')
              ),

              Divider(
                height: 20,
                thickness: 2,
                color: Colors.black,
              ),

              TextField(
                controller: authenticateLoginTextFieldController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'login',
                )
              ),
              ElevatedButton(
                onPressed: () async {
                  final authenticateSignedResponse = await blisachePlugin.authenticate(login: authenticateLoginTextFieldController.text);
                  final authenticateResponse = await http.post(
                    Uri.https(yourDomain, '/server/authenticate'),
                    headers: { "Content-Type": "application/json" },
                    body: jsonEncode(authenticateSignedResponse.toJson())
                  );
                  assert(authenticateResponse.statusCode == 200);
                  print("authenticated");
                },
                child: const Text('Authenticate')
              )
            ]
          )
        ),
      ),
    );
  }
}
