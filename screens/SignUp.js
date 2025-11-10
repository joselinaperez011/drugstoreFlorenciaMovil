import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db } from '../src/config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import CustomAlert from '../components/CustomAlert';

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const showCustomAlert = (title, message, type = 'info') => {
    setAlertConfig({
      title,
      message,
      type,
      show: true
    });
    setShowAlert(true);
  };

  const validateName = (text, fieldName) => {
    const lettersOnly = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]*$/;
    if (!lettersOnly.test(text)) {
      if (fieldName === 'firstName') {
        setErrors({...errors, firstName: "Solo se permiten letras"});
      } else {
        setErrors({...errors, lastName: "Solo se permiten letras"});
      }
    } else {
      const newErrors = {...errors};
      if (fieldName === 'firstName') {
        newErrors.firstName = text.trim() ? "" : "El nombre es obligatorio.";
        setFirstName(text);
      } else {
        newErrors.lastName = text.trim() ? "" : "El apellido es obligatorio.";
        setLastName(text);
      }
      setErrors(newErrors);
    }
  };

  const validateEmailRealTime = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {...errors};
    
    if (!text.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!emailRegex.test(text)) {
      newErrors.email = "Formato de correo inválido (ej: usuario@email.com).";
    } else {
      newErrors.email = "";
    }
    setErrors(newErrors);
  };

  const validatePasswordRealTime = (text) => {
    setPassword(text);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const newErrors = {...errors};
    
    if (!text.trim()) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (!passwordRegex.test(text)) {
      newErrors.password = "Debe tener 8 caracteres, mayúscula, minúscula y número.";
    } else {
      newErrors.password = "";
    }
    setErrors(newErrors);
  };

  const validateConfirmPasswordRealTime = (text) => {
    setConfirmPassword(text);
    const newErrors = {...errors};
    
    if (!text.trim()) {
      newErrors.confirmPassword = "Confirme su contraseña.";
    } else if (password !== text) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    } else {
      newErrors.confirmPassword = "";
    }
    setErrors(newErrors);
  };

  const validateFields = () => {
    let newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "El nombre es obligatorio.";
    if (!lastName.trim()) newErrors.lastName = "El apellido es obligatorio.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) newErrors.email = "El correo es obligatorio.";
    else if (!emailRegex.test(email)) newErrors.email = "Formato de correo inválido (ej: usuario@email.com).";

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password) newErrors.password = "La contraseña es obligatoria.";
    else if (!passwordRegex.test(password)) {
      newErrors.password = "Debe tener 8 caracteres, mayúscula, minúscula y número.";
    }

    if (!confirmPassword) newErrors.confirmPassword = "Confirme su contraseña.";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    const allFieldsEmpty = !firstName.trim() && !lastName.trim() && !email.trim() && !password.trim() && !confirmPassword.trim();
    
    if (allFieldsEmpty) {
      showCustomAlert("Campos requeridos", "Todos los campos son obligatorios. Por favor complete el formulario.", "info");
      return;
    }

    if (!validateFields()) return;

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // 🔥 GUARDAR EN FIRESTORE CON EL ID DEL USUARIO
      await setDoc(doc(db, 'users', user.uid), {
        nombre: firstName.trim(),
        apellido: lastName.trim(),
        email: email.trim(),
        teléfono: '',
        dirección: '',
        fecha_de_nacimiento: '',
        dni: '',
        género: '',
        foto_perfil: '',
        fecha_creacion: new Date(),
        uid: user.uid
      });

      showCustomAlert("¡Registro exitoso!", "Usuario registrado con éxito. Ahora puedes iniciar sesión.", "success");
      
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
        default:
          errorMessage = `Error: ${error.message}`;
      }
      showCustomAlert("Error de registro", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAlertConfirm = () => {
    setShowAlert(false);
    if (alertConfig.type === 'success') {
      navigation.navigate('Login');
    }
  };

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  return (
    <ImageBackground
      source={require('../assets/fondo.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Crea tu cuenta</Text>

            <View style={styles.boxContainer}>
              <View style={styles.boxInput}>
                <FontAwesome name="user" size={20} color="#FFAB32" style={styles.icon} />
                <TextInput
                  style={styles.boxTextInput}
                  placeholder="Nombre"
                  placeholderTextColor="#999"
                  value={firstName}
                  onChangeText={(text) => validateName(text, 'firstName')}
                  editable={!loading}
                />
              </View>
              {errors.firstName ? (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              ) : null}
            </View>

            <View style={styles.boxContainer}>
              <View style={styles.boxInput}>
                <FontAwesome name="user" size={20} color="#FFAB32" style={styles.icon} />
                <TextInput
                  style={styles.boxTextInput}
                  placeholder="Apellido"
                  placeholderTextColor="#999"
                  value={lastName}
                  onChangeText={(text) => validateName(text, 'lastName')}
                  editable={!loading}
                />
              </View>
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : null}
            </View>

            <View style={styles.boxContainer}>
              <View style={styles.boxInput}>
                <FontAwesome name="envelope" size={20} color="#FFAB32" style={styles.icon} />
                <TextInput
                  style={styles.boxTextInput}
                  placeholder="usuario@email.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={validateEmailRealTime}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.boxContainer}>
              <View style={styles.boxInput}>
                <FontAwesome name="lock" size={20} color="#FFAB32" style={styles.icon} />
                <TextInput
                  style={styles.boxTextInput}
                  placeholder="Contraseña"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={validatePasswordRealTime}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
                  <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#FFAB32" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

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
                  <Text style={[styles.validationText, hasLowerCase && styles.validationSuccess]}>
                    {hasLowerCase ? '✔' : '○'} 1 letra minúscula
                  </Text>
                  <Text style={[styles.validationText, hasNumber && styles.validationSuccess]}>
                    {hasNumber ? '✔' : '○'} 1 número
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.boxContainer}>
              <View style={styles.boxInput}>
                <FontAwesome name="lock" size={20} color="#FFAB32" style={styles.icon} />
                <TextInput
                  style={styles.boxTextInput}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={validateConfirmPasswordRealTime}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                  <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color="#FFAB32" />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
              {passwordsMatch && (
                <Text style={styles.successText}>✓ Las contraseñas coinciden</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.imageButton, loading && styles.disabledButton]} 
              onPress={handleSignUp}
              disabled={loading}
            >
              <ImageBackground
                source={require('../assets/fondo.jpeg')}
                style={styles.buttonBackground}
                resizeMode="cover"
              >
                <Text style={styles.imageButtonText}>
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Text>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text style={styles.loginText}>¿Ya tenés una cuenta? Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={handleAlertConfirm}
        confirmText="Aceptar"
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: 'white',
    width: '100%',
    minHeight: '85%',
    padding: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 25, color: '#087182', textAlign: 'center' },
  boxContainer: { marginBottom: 15 },
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
  boxTextInput: { flex: 1, height: 40, fontSize: 16, color: '#333' },
  icon: { marginRight: 10 },
  validationContainer: { marginTop: 10, marginLeft: 5 },
  validationTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  validationRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  validationText: { fontSize: 12, color: '#666', flex: 1 },
  validationSuccess: { color: '#4CAF50', fontWeight: '500' },
  imageButton: { 
    height: 50, 
    borderRadius: 10, 
    overflow: 'hidden', 
    marginBottom: 20,  
    width: 200, 
    alignSelf: 'center' 
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonBackground: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  imageButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  loginText: { 
    textAlign: 'center', 
    color: '#087182', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  errorText: { 
    color: 'red', 
    fontSize: 12, 
    marginTop: 3, 
    marginLeft: 5 
  },
  successText: { 
    color: '#4CAF50', 
    fontSize: 12, 
    marginTop: 3, 
    marginLeft: 5, 
    fontWeight: '500' 
  },
});