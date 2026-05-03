import { Button, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useState } from 'react';
import { Blisache } from 'blisache-reactnative';

function createBlisache() {
  return new Blisache('blisache.com');
}

function App() {
  const [blisachePlugin, _] = useState(createBlisache);
  const [registerLogin, setRegisterLogin] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [authenticateLogin, setAuthenticateLogin] = useState('');

  return (
    <SafeAreaView style={{ paddingTop: 50 }}>
      <TextInput
        placeholder="login"
        value={registerLogin}
        onChangeText={(text) => setRegisterLogin(text)}
      />
      <TextInput
        placeholder="name"
        value={registerName}
        onChangeText={(text) => setRegisterName(text)}
      />
      <Button
        title="Register"
        onPress={async () => {
          const registerSignedResponse = await blisachePlugin.register(
            registerLogin,
            registerName
          );
          const registerResponse = await fetch(
            'https://blisache.com/server/register',
            {
              method: 'POST',
              body: JSON.stringify(registerSignedResponse),
              headers: {
                'Content-type': 'application/json',
              },
            }
          );
          if (!(registerResponse.status === 200)) {
            throw new Error('server response code is not 200');
          } else {
            console.log('registered');
          }
        }}
      />

      <TextInput
        placeholder="login"
        value={authenticateLogin}
        onChangeText={(text) => setAuthenticateLogin(text)}
      />
      <Button
        title="Authenticate"
        onPress={async () => {
          const authenticateSignedResponse = await blisachePlugin.authenticate(
            authenticateLogin.length === 0 ? undefined : authenticateLogin
          );
          const authenticateResponse = await fetch(
            'https://blisache.com/server/authenticate',
            {
              method: 'POST',
              body: JSON.stringify(authenticateSignedResponse),
              headers: {
                'Content-type': 'application/json',
              },
            }
          );
          if (!(authenticateResponse.status === 200)) {
            throw new Error('server response code is not 200');
          } else {
            console.log('authenticated');
          }
        }}
      />
    </SafeAreaView>
  );
}

export default App;
