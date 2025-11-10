import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import CustomAlert from '../components/CustomAlert';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  // ALERTS PERSONALIZADOS
  const showCustomAlert = (title, message, type = 'error', onConfirmCallback = null) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirmCallback
    });
    setShowAlert(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showCustomAlert("Campos requeridos", "Por favor ingrese ambos campos para continuar.", "info");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // CALLBACK DE NAVEGACIÓN
      showCustomAlert(
        "¡Inicio exitoso!", 
        "Has iniciado sesión correctamente. Puedes dirigirte al Inicio", 
        "success",
        () => {
          setShowAlert(false);
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }
      );
      
    } catch (error) {
      let errorMessage = "Usuario o contraseña no válidos.";
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
        default:
          errorMessage = "Credenciales inválidas. Intente nuevamente.";
      }
      showCustomAlert("Error de acceso", errorMessage, "error");
    }
  };

  // CIERRE DEL ALERT
  const handleAlertClose = () => {
    setShowAlert(false);
    
    // Ejecutar callback si existe
    if (alertConfig.onConfirm) {
      alertConfig.onConfirm();
    }
  };

  return (
    <ImageBackground
      source={require('../assets/fondo2.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.card}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Iniciar sesión</Text>

            {/* BOX DE CORREO */}
            <View style={styles.boxContainer}>
              <Text style={styles.boxLabel}>Usuario</Text>
              <View style={styles.boxInput}>
                <FontAwesome name="envelope" size={20} color="#FFAB32" style={styles.icon} />
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
                <FontAwesome name="lock" size={20} color="#FFAB32" style={styles.icon} />
                <TextInput
                  style={styles.boxTextInput}
                  placeholder="Contraseña"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#FFAB32" />
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
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No estas registrado? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.registerLink}>Crear cuenta</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* ALERT PERSONALIZADO CON MODAL */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={handleAlertClose}
        confirmText="Aceptar"
      />
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#087182',
    fontSize: 16,
    fontWeight: '500',
  },
  registerLink: {
    color: '#087182',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationColor: '#087182',
    textDecorationStyle: 'solid',
  },  
  card: {
    backgroundColor: 'white',
    width: '100%',
    height: '65%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 30,
    paddingBottom: 40,
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
    color: '#2B2B2B',
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
    height: 35,
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
    color: '#16a0b6ff',
    fontSize: 14,
    fontWeight: '500',
  },
  // BOTÓN CON FONDO DE IMAGEN
  imageButton: {
    width: 200,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    alignSelf: 'center',
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
});