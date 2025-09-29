import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingrese ambos campos.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login exitoso", "Has iniciado sesión correctamente.");
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] }); 
    } catch (error) {
      let errorMessage = "Hubo un problema al iniciar sesión.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/wrong-password':
          errorMessage = "La contraseña es incorrecta.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/fondo.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        
        <View style={styles.card}>
          <Text style={styles.title}>Iniciar sesión</Text>

          {/* BOX DE CORREO */}
          <View style={styles.boxContainer}>
            <Text style={styles.boxLabel}>Usuario</Text>
            <View style={styles.boxInput}>
              <FontAwesome name="envelope" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.boxTextInput}
                placeholder="usuario@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* BOX DE CONTRASEÑA */}
          <View style={styles.boxContainer}>
            <Text style={styles.boxLabel}>Contraseña</Text>
            <View style={styles.boxInput}>
              <FontAwesome name="lock" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.boxTextInput}
                placeholder="Contraseña"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* LINK OLVIDÉ CONTRASEÑA */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* BOTÓN CON FONDO DE IMAGEN */}
          <TouchableOpacity style={styles.imageButton} onPress={handleLogin}>
            <ImageBackground
              source={require('../assets/fondo.jpeg')}
              style={styles.buttonBackground}
              resizeMode="cover"
            >
              <Text style={styles.imageButtonText}>Ingresar</Text>
            </ImageBackground>
          </TouchableOpacity>

          {/* REGISTRO */}
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.registerText}>¿No estas registrado? Crear cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    position: 'absolute',
    top: 50,
  },
  card: {
    backgroundColor: 'white',
    width: '100%',
    height: '70%',
    padding: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#087182',
    textAlign: 'center',
  },
  // ESTILOS PARA LOS BOX
  boxContainer: {
    marginBottom: 20,
  },
  boxLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  boxInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  boxTextInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginRight: 10,
  },
  // LINK OLVIDÉ CONTRASEÑA
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#087182',
    fontSize: 14,
    fontWeight: '500',
  },
  // BOTÓN CON FONDO DE IMAGEN
  imageButton: {
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // TEXTO DE REGISTRO
  registerText: {
    textAlign: 'center',
    color: '#087182',
    fontSize: 16,
    fontWeight: '500',
  },
});