import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade', // Transição mais elegante ao abrir o login
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* Telas futuras como RecuperarSenha entrariam aqui */}
    </Stack.Navigator>
  );
}