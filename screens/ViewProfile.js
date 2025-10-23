import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  BackHandler,
  Image // NUEVO: Importar Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// Importar Firestore
import { db } from '../src/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function ViewProfile({ navigation, route }) {
  const { userData, firestoreData } = route.params || {};
  const [profileData, setProfileData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    dni: '',
    gender: '',
    profileImage: '' // NUEVO: agregar profileImage al estado
  });

  useEffect(() => {
    // Cargar datos combinados de userData y firestoreData
    loadCombinedProfileData();

    // Manejar botón de retroceso
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [userData, firestoreData]);

  // Función para cargar datos desde Firestore
  const loadProfileDataFromFirestore = async () => {
    try {
      const userRef = doc(db, 'users', 'prueba');
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const firestoreUserData = userSnap.data();
        console.log('📸 Datos de Firestore cargados:', firestoreUserData); // NUEVO: log
        return firestoreUserData;
      } else {
        console.log('❌ No se encontró documento en Firestore');
      }
    } catch (error) {
      console.error('Error cargando datos de Firestore:', error);
    }
    return null;
  };

  const loadCombinedProfileData = async () => {
    let combinedData = {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      birthDate: '',
      dni: '',
      gender: '',
      profileImage: '' // NUEVO
    };

    console.log('🔄 Cargando datos combinados...'); // NUEVO: log

    // PRIMERO: Intentar cargar datos desde Firestore (más actualizados)
    const firestoreData = await loadProfileDataFromFirestore();
    
    if (firestoreData) {
      // Mapear campos de Firestore (español) a nuestro estado (inglés)
      combinedData = {
        name: firestoreData.nombre || '',
        lastName: firestoreData.apellido || '',
        email: firestoreData.email || '',
        phone: firestoreData.teléfono || '',
        address: firestoreData.dirección || '',
        birthDate: firestoreData.fecha_de_nacimiento || '',
        dni: firestoreData.dni || '',
        gender: firestoreData.género || '',
        profileImage: firestoreData.foto_perfil || '' // NUEVO: cargar foto de Cloudinary
      };
      
      console.log('✅ Datos mapeados desde Firestore:', combinedData); // NUEVO: log
    } 
    // SEGUNDO: Si no hay datos en Firestore, usar los datos de autenticación
    else if (userData) {
      console.log('📄 Usando datos de userData:', userData); // NUEVO: log
      combinedData = {
        ...combinedData,
        name: userData.name || '',
        lastName: userData.lastName || '',
        email: userData.email || ''
      };
    }

    // TERCERO: Si recibimos datos por parámetros, tienen prioridad
    if (route.params?.firestoreData) {
      console.log('🎯 Usando datos de parámetros:', route.params.firestoreData); // NUEVO: log
      const paramsData = route.params.firestoreData;
      combinedData = {
        name: paramsData.nombre || combinedData.name,
        lastName: paramsData.apellido || combinedData.lastName,
        email: paramsData.email || combinedData.email,
        phone: paramsData.teléfono || combinedData.phone,
        address: paramsData.dirección || combinedData.address,
        birthDate: paramsData.fecha_de_nacimiento || combinedData.birthDate,
        dni: paramsData.dni || combinedData.dni,
        gender: paramsData.género || combinedData.gender,
        profileImage: paramsData.foto_perfil || combinedData.profileImage // NUEVO
      };
    }

    console.log('🎯 Datos finales combinados:', combinedData); // NUEVO: log
    setProfileData(combinedData);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', {
      profileData,
      onSave: (updatedData) => {
        // Actualizar estado local
        setProfileData(updatedData);
        // Recargar datos para asegurar que tenemos la versión más reciente
        loadCombinedProfileData();
      }
    });
  };

  // NUEVO: Función para mostrar foto o iniciales
  const renderProfileImage = () => {
    console.log('🖼️ Renderizando imagen:', profileData.profileImage); // NUEVO: log
    
    if (profileData.profileImage) {
      return (
        <Image 
          source={{ uri: profileData.profileImage }} 
          style={styles.profileImage}
          onError={(error) => {
            console.log('❌ Error cargando imagen:', error);
          }}
          onLoad={() => {
            console.log('✅ Imagen cargada exitosamente');
          }}
        />
      );
    } else {
      return (
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {getAvatarInitials()}
          </Text>
        </View>
      );
    }
  };

  // Función para obtener iniciales del avatar
  const getAvatarInitials = () => {
    if (profileData.name && profileData.lastName) {
      return `${profileData.name.charAt(0)}${profileData.lastName.charAt(0)}`;
    }
    if (profileData.name) {
      return `${profileData.name.charAt(0)}`;
    }
    return "U";
  };

  const InfoField = ({ label, value }) => (
    <View style={styles.infoField}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value || 'No especificado'}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground 
      source={require('../assets/fondo.jpeg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar y Nombre - ACTUALIZADO */}
          <View style={styles.profileHeader}>
            {renderProfileImage()}
            <Text style={styles.userName}>
              {profileData.name} {profileData.lastName}
            </Text>
            <Text style={styles.userEmail}>{profileData.email}</Text>
            {profileData.phone && (
              <Text style={styles.userPhone}>{profileData.phone}</Text>
            )}
            {profileData.profileImage && (
              <Text style={styles.photoIndicator}>✓ Foto de perfil</Text>
            )}
          </View>

          {/* Información Personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <InfoField label="Nombre" value={profileData.name} />
            <InfoField label="Apellido" value={profileData.lastName} />
            <InfoField label="Correo electrónico" value={profileData.email} />
            <InfoField label="Teléfono" value={profileData.phone} />
            <InfoField label="Domicilio" value={profileData.address} />
            <InfoField label="Fecha de nacimiento" value={profileData.birthDate} />
            <InfoField label="DNI" value={profileData.dni} />
            <InfoField label="Género" value={profileData.gender} />
          </View>

          {/* Botón Editar Perfil */}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <MaterialIcons name="edit" size={20} color="white" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>

          {/* Espacio al final */}
          <View style={styles.spacer} />
        </ScrollView>
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // NUEVO: Estilo para la imagen de perfil
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#035c70',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#035c70',
    marginBottom: 5,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 3,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  photoIndicator: {
    fontSize: 12,
    color: '#12B05B',
    fontWeight: '600',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#035c70',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoField: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 5,
  },
  valueContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  value: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#035c70',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  spacer: {
    height: 30,
  },
});