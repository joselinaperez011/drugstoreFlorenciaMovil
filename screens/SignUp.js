import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Error",
        "La contraseña debe tener al menos 8 caracteres incluyendo una letra mayúscula, una minúscula, un número y un carácter especial."
      );
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Registro exitoso", "Usuario registrado con éxito.");
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); 
    } catch (error) {
      let errorMessage = "Hubo un problema al registrar el usuario.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "El correo electrónico ya está en uso.";
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña es demasiado débil.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
      }
      Alert.alert("Error", errorMessage);
    }
  };

  // Validaciones en tiempo real para la contraseña
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    <ImageBackground
      source={require('../assets/fondo.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        
        <View style={styles.card}>
          <Text style={styles.title}>Crea tu cuenta</Text>

          {/* Nombre */}
          <View style={styles.boxContainer}>
            <View style={styles.boxInput}>
              <FontAwesome name="user" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.boxTextInput}
                placeholder="Nombre"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
          </View>

          {/* Apellido */}
          <View style={styles.boxContainer}>
            <View style={styles.boxInput}>
              <FontAwesome name="user" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.boxTextInput}
                placeholder="Apellido"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          {/* Correo */}
          <View style={styles.boxContainer}>
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

          {/* Contraseña */}
          <View style={styles.boxContainer}>
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
            
            {/* Validaciones de contraseña */}
            <View style={styles.validationContainer}>
              <Text style={styles.validationTitle}>La contraseña debe contener:</Text>
              <View style={styles.validationRow}>
                <Text style={[styles.validationText, hasMinLength && styles.validationSuccess]}>
                  {hasMinLength ? '✔' : '○'} Mínimo 8 caracteres
                </Text>
                <Text style={[styles.validationText, hasUpperCase && styles.validationSuccess]}>
                  {hasUpperCase ? '✔' : '○'} 1 letra mayúscula
                </Text>
              </View>
              <View style={styles.validationRow}>
                <Text style={[styles.validationText, hasNumber && styles.validationSuccess]}>
                  {hasNumber ? '✔' : '○'} 1 número
                </Text>
              </View>
              <View style={styles.validationRow}>
                <Text style={[styles.validationText, hasSpecialChar && styles.validationSuccess]}>
                  {hasSpecialChar ? '✔' : '○'} 1 carácter especial
                </Text>
              </View>
            </View>
          </View>

          {/* Confirmar Contraseña */}
          <View style={styles.boxContainer}>
            <View style={styles.boxInput}>
              <FontAwesome name="lock" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.boxTextInput}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Línea divisoria */}
          <View style={styles.divider} />

          {/* Botón Crear Cuenta */}
          <TouchableOpacity style={styles.imageButton} onPress={handleSignUp}>
            <ImageBackground
              source={require('../assets/fondo.jpeg')}
              style={styles.buttonBackground}
              resizeMode="cover"
            >
              <Text style={styles.imageButtonText}>Crear cuenta</Text>
            </ImageBackground>
          </TouchableOpacity>

          {/* Link para login */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? Inicio Sesión</Text>
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
  card: {
    backgroundColor: 'white',
    width: '100%',
    height: '88%',
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
    marginBottom: 25,
    color: '#087182',
    textAlign: 'center',
  },
  boxContainer: {
    marginBottom: 15,
  },
  boxInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 3,
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
  // VALIDACIONES DE CONTRASEÑA
  validationContainer: {
    marginTop: 10,
    marginLeft: 5,
  },
  validationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  validationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  validationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  validationSuccess: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
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
  loginText: {
    textAlign: 'center',
    color: '#087182',
    fontSize: 16,
    fontWeight: '500',
  },
});