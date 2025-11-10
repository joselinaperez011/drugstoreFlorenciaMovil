import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Alert,
  Platform,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { db, auth } from '../src/config/firebaseConfig'; 
import { doc, setDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../src/config/cloudinary';

export default function EditProfile({ navigation, route }) {
  const { profileData, onSave } = route.params || {};

  const [formData, setFormData] = useState({
    name: profileData?.name || '',
    lastName: profileData?.lastName || '',
    email: profileData?.email || '',
    phone: profileData?.phone || '',
    address: profileData?.address || '',
    birthDate: profileData?.birthDate || '',
    dni: profileData?.dni || '',
    gender: profileData?.gender || '',
    profileImage: profileData?.profileImage || '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Función para subir imagen a Cloudinary
  const uploadImageToCloudinary = async (imageUri) => {
    try {
      setUploadingImage(true);
      console.log('Subiendo imagen a Cloudinary...');
      
      const imageUrl = await uploadToCloudinary(imageUri);
      console.log('Imagen subida exitosamente:', imageUrl);
      
      return imageUrl;
      
    } catch (error) {
      console.error('Error subiendo imagen a Cloudinary:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Función para seleccionar imagen de galería
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería para cambiar la foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        
        try {
          Alert.alert('Subiendo', 'Subiendo foto de perfil...');
          const imageUrl = await uploadImageToCloudinary(imageUri);
          handleChange('profileImage', imageUrl);
          Alert.alert('Éxito', 'Foto de perfil actualizada y guardada en la nube');
        } catch (error) {
          console.error('Error en pickImage:', error);
          Alert.alert('Error', 'No se pudo subir la foto a la nube');
        }
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Función para tomar foto con cámara
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu cámara para tomar fotos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        try {
          Alert.alert('Subiendo', 'Subiendo foto de perfil...');
          const imageUrl = await uploadImageToCloudinary(imageUri);
          handleChange('profileImage', imageUrl);
          Alert.alert('Éxito', 'Foto de perfil actualizada y guardada en la nube');
        } catch (error) {
          Alert.alert('Error', 'No se pudo subir la foto a la nube');
        }
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  // Mostrar opciones de foto
  const showImageOptions = () => {
    Alert.alert(
      'Foto de perfil',
      '¿Cómo quieres agregar tu foto?',
      [
        { text: 'Tomar foto', onPress: takePhoto },
        { text: 'Elegir de galería', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const saveToFirestore = async (userData) => {
    try {
      const user = auth.currentUser;
      let userRef;
      
      if (user) {
        userRef = doc(db, 'users', user.uid);
        console.log('Guardando en documento del usuario:', user.uid);
      } else {
        userRef = doc(db, 'users', 'prueba');
        console.log('Guardando en documento prueba (fallback)');
      }
      
      await setDoc(userRef, {
        nombre: userData.name,
        apellido: userData.lastName,
        email: userData.email,
        teléfono: userData.phone,
        dirección: userData.address,
        fecha_de_nacimiento: userData.birthDate,
        dni: userData.dni,
        género: userData.gender,
        foto_perfil: userData.profileImage,
        timestamp: new Date()
      }, { merge: true });
      
      console.log('✅ Datos guardados en Firestore:', {
        nombre: userData.name,
        teléfono: userData.phone,
        dirección: userData.address,
        dni: userData.dni,
        género: userData.gender
      });
      return true;
    } catch (error) {
      console.error('❌ Error guardando en Firestore:', error);
      Alert.alert('Error', `No se pudo guardar: ${error.message}`);
      return false;
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      if (!formData.name || !formData.lastName || !formData.email) {
        Alert.alert('Error', 'Por favor complete los campos obligatorios');
        setIsSaving(false);
        return;
      }

      console.log('📝 Guardando datos:', formData);

      const firestoreSuccess = await saveToFirestore(formData);
      
      if (firestoreSuccess) {
        if (onSave) {
          onSave(formData);
        }
        
        Alert.alert(
          '✅ Perfil actualizado', 
          'Los datos y foto se guardaron correctamente',
          [{ 
            text: 'OK', 
            onPress: () => {
              navigation.navigate('ViewProfile', { 
                refresh: true,
                timestamp: new Date().getTime()
              });
            }
          }]
        );
      } else {
        Alert.alert('Error', 'No se pudo guardar en la base de datos');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar los datos');
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar selección de fecha
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('es-AR');
      handleChange('birthDate', formattedDate);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/fondo.jpeg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    > 
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Editar Perfil</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* SECCIÓN SUPERIOR CON FOTO */}
              <View style={styles.profileHeader}>
                <TouchableOpacity 
                  style={styles.photoContainer}
                  onPress={showImageOptions}
                  disabled={uploadingImage || isSaving}
                >
                  {formData.profileImage ? (
                    <Image 
                      source={{ uri: formData.profileImage }} 
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <MaterialIcons name="add-a-photo" size={30} color="#7F8C8D" />
                    </View>
                  )}
                  
                  {/* Badge de cámara */}
                  <View style={styles.cameraBadge}>
                    <MaterialIcons name="photo-camera" size={16} color="white" />
                  </View>

                  {/* Indicador de carga */}
                  {uploadingImage && (
                    <View style={styles.uploadingOverlay}>
                      <MaterialIcons name="cloud-upload" size={24} color="white" />
                      <Text style={styles.uploadingText}>Subiendo...</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.profileName}>
                  {formData.name} {formData.lastName}
                </Text>
                <Text style={styles.profileEmail}>{formData.email}</Text>
                <Text style={styles.profilePhone}>{formData.phone || 'Sin teléfono'}</Text>
                
                {formData.profileImage && (
                  <Text style={styles.photoSavedText}>✓ Foto guardada en la nube</Text>
                )}
              </View>

              {/* INFORMACIÓN PERSONAL */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información Personal</Text>

                {/* Nombre */}
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => handleChange('name', text)}
                  placeholder="Ingrese su nombre"
                />

                {/* Apellido */}
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => handleChange('lastName', text)}
                  placeholder="Ingrese su apellido"
                />

                {/* Correo electrónico (solo lectura) */}
                <Text style={styles.label}>Correo electrónico *</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={formData.email}
                  editable={false}
                  selectTextOnFocus={false}
                />

                {/* Teléfono */}
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => handleChange('phone', text)}
                  placeholder="Ingrese su teléfono"
                  keyboardType="phone-pad"
                />

                {/* Domicilio */}
                <Text style={styles.label}>Domicilio</Text>
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(text) => handleChange('address', text)}
                  placeholder="Ingrese su domicilio"
                />

                {/* Fecha de nacimiento con calendario */}
                <Text style={styles.label}>Fecha de nacimiento</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formData.birthDate || 'Seleccionar fecha'}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color="#035c70" />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={
                      formData.birthDate
                        ? new Date(formData.birthDate.split('/').reverse().join('-'))
                        : new Date()
                    }
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}

                {/* DNI */}
                <Text style={styles.label}>DNI</Text>
                <TextInput
                  style={styles.input}
                  value={formData.dni}
                  onChangeText={(text) => handleChange('dni', text)}
                  placeholder="Ingrese su DNI"
                  keyboardType="numeric"
                />

                {/* Género (Selector) */}
                <Text style={styles.label}>Género</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.gender}
                    onValueChange={(itemValue) => handleChange('gender', itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Seleccionar género" value="" />
                    <Picker.Item label="Femenino" value="Femenino" />
                    <Picker.Item label="Masculino" value="Masculino" />
                    <Picker.Item label="Otro" value="Otro" />
                    <Picker.Item label="Prefiero no decirlo" value="No especificado" />
                  </Picker>
                </View>
              </View>

              {/* Botón Guardar */}
              <TouchableOpacity 
                style={[styles.saveButton, (isSaving || uploadingImage) && styles.disabledButton]} 
                onPress={handleSave}
                disabled={isSaving || uploadingImage}
              >
                <MaterialIcons name="save" size={20} color="white" />
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.requiredText}>* Campos obligatorios</Text>

              {/* Espacio para el teclado */}
              <View style={styles.keyboardSpacer} />
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(3, 92, 112, 0.9)',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: { width: 30 },
  content: { 
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 0,
  },
  keyboardSpacer: {
    height: 100,
  },
  
  /* ESTILOS PARA EL HEADER CON FOTO */
  profileHeader: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    elevation: 3,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECF0F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BDC3C7',
    borderStyle: 'dashed',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#035c70',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#035c70',
    marginBottom: 5,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 3,
    textAlign: 'center',
  },
  profilePhone: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  photoSavedText: {
    fontSize: 12,
    color: '#12B05B',
    fontWeight: '600',
    marginTop: 5,
  },

  /* ESTILOS EXISTENTES */
  section: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#035c70',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1',
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 15,
  },
  disabledInput: {
    backgroundColor: '#E9ECEF',
    color: '#7F8C8D',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    marginBottom: 15,
  },
  picker: {
    height: 50,
    color: '#2C3E50',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#035c70',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#7F8C8D',
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  requiredText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 10,
  },
});