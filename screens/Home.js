import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ImageBackground,
  ScrollView,
  Dimensions,
  Modal,
  BackHandler
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
// Importar Firestore
import { db } from '../src/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function Home({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [firestoreData, setFirestoreData] = useState(null);

  // Obtener datos del usuario al cargar
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        // Extraer nombre y apellido del displayName
        let name = "Usuario";
        let lastName = "";
        
        if (user.displayName) {
          const nameParts = user.displayName.split(' ');
          name = nameParts[0] || "Usuario";
          lastName = nameParts.slice(1).join(' ') || "";
        } else if (user.email) {
          name = user.email.split('@')[0];
        }
        
        setUserData({
          name: name,
          lastName: lastName,
          email: user.email || ""
        });

        // CARGAR DATOS DESDE FIRESTORE
        await loadUserDataFromFirestore();
      }
    };

    fetchUserData();
  }, []);

  // Recargar datos cuando el modal de perfil se abre
  useEffect(() => {
    if (profileModalVisible) {
      loadUserDataFromFirestore();
    }
  }, [profileModalVisible]);

  // Función para cargar datos desde Firestore
  const loadUserDataFromFirestore = async () => {
    try {
      const userRef = doc(db, 'users', 'prueba');
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const firestoreUserData = userSnap.data();
        setFirestoreData(firestoreUserData);
        console.log('📸 Datos cargados desde Firestore en Home:', firestoreUserData);
      } else {
        console.log('No se encontraron datos en Firestore');
      }
    } catch (error) {
      console.error('Error cargando datos de Firestore:', error);
    }
  };

  // Botón de retroceso
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (menuVisible) {
          setMenuVisible(false);
          return true;
        }
        if (profileModalVisible) {
          setProfileModalVisible(false);
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [menuVisible, profileModalVisible]);

  const handleLogOut = async () => {
    try {
      await signOut(auth);  
      navigation.replace('Login');  
    } catch (error) {
      console.log("Error al cerrar sesión:", error);
    }
  };

  const handleViewProfile = () => {
    setProfileModalVisible(false);
    // Pasar tanto los datos de auth como los de firestore
    navigation.navigate('ViewProfile', { 
      userData: userData,
      firestoreData: firestoreData
    });
  };

  // Función para obtener el nombre completo desde Firestore
  const getFullName = () => {
    if (firestoreData && firestoreData.nombre && firestoreData.apellido) {
      return `${firestoreData.nombre} ${firestoreData.apellido}`;
    }
    if (userData) {
      return `${userData.name} ${userData.lastName}`;
    }
    return "Usuario";
  };

  // NUEVO: Función para renderizar la foto de perfil o iniciales
  const renderProfileImage = () => {
    if (firestoreData && firestoreData.foto_perfil) {
      return (
        <Image 
          source={{ uri: firestoreData.foto_perfil }} 
          style={styles.profileImage}
          onError={(error) => {
            console.log('❌ Error cargando imagen en modal:', error);
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

  // Función para obtener las iniciales del avatar
  const getAvatarInitials = () => {
    if (firestoreData && firestoreData.nombre && firestoreData.apellido) {
      return `${firestoreData.nombre.charAt(0)}${firestoreData.apellido.charAt(0)}`;
    }
    if (userData) {
      return `${userData.name.charAt(0)}${userData.lastName.charAt(0)}`;
    }
    return "U";
  };

  const MenuItem = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <MaterialIcons name={icon} size={24} color="#035c70" />
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );

  const StatCard = ({ value, title, color }) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const QuickAction = ({ icon, title, color }) => (
    <TouchableOpacity style={[styles.quickAction, { backgroundColor: color }]}>
      <MaterialIcons name={icon} size={28} color="white" />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
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
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <MaterialIcons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.storeName}>Florencia Drugstore</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setProfileModalVisible(true)}
          >
            <MaterialIcons name="person" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Contenido Principal */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Estadísticas */}
          <View style={styles.statsContainer}>
            <StatCard 
              value="$2.350" 
              title="Caja actual" 
              color="rgba(255,255,255,0.9)" 
            />
            <StatCard 
              value="$3.480" 
              title="Ventas del día" 
              color="rgba(255,255,255,0.9)" 
            />
            <StatCard 
              value="$1.210" 
              title="Gastos del día" 
              color="rgba(255,255,255,0.9)" 
            />
          </View>

          {/* Acciones Rápidas */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Acciones rápidas</Text>
            <View style={styles.quickActions}>
              <View style={styles.quickActionsRow}>
                <QuickAction icon="point-of-sale" title="Registrar venta" color="#12B05B" />
                <QuickAction icon="money-off" title="Registrar gasto" color="#EEA615" />
              </View>
              <View style={styles.quickActionsRow}>
                <QuickAction icon="inventory" title="Inventario" color="#34495E" />
                <QuickAction icon="local-shipping" title="Proveedores" color="#1B88B8" />
              </View>
              <View style={styles.quickActionsRow}>
                <QuickAction icon="account-balance-wallet" title="Cierre de caja" color="#136C6B" />
                <QuickAction icon="settings" title="Configuración" color="#3F847E" />
              </View>
            </View>
          </View>

          {/* Últimas Ventas */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Últimas ventas</Text>
            <View style={styles.salesList}>
              <View style={styles.saleItem}>
                <View style={styles.saleInfo}>
                  <Text style={styles.productName}>Coca Cola 500ml</Text>
                  <Text style={styles.saleTime}>Hace 15 min</Text>
                </View>
                <Text style={styles.saleAmount}>$1800</Text>
              </View>
              <View style={styles.saleItem}>
                <View style={styles.saleInfo}>
                  <Text style={styles.productName}>Snack Mix</Text>
                  <Text style={styles.saleTime}>Hace 30 min</Text>
                </View>
                <Text style={styles.saleAmount}>$2300</Text>
              </View>
              <View style={styles.saleItem}>
                <View style={styles.saleInfo}>
                  <Text style={styles.productName}>Alfajor Milka</Text>
                  <Text style={styles.saleTime}>Hace 45 min</Text>
                </View>
                <Text style={styles.saleAmount}>$1200</Text>
              </View>
            </View>
          </View>

          {/* Productos más vendidos */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Productos más vendidos</Text>
            <View style={styles.productsGrid}>
              <View style={styles.productCard}>
                <Text style={styles.productRank}>1</Text>
                <Text style={styles.productNameSmall}>Coca Cola</Text>
                <Text style={styles.productSales}>45 ventas</Text>
              </View>
              <View style={styles.productCard}>
                <Text style={styles.productRank}>2</Text>
                <Text style={styles.productNameSmall}>Snacks</Text>
                <Text style={styles.productSales}>38 ventas</Text>
              </View>
              <View style={styles.productCard}>
                <Text style={styles.productRank}>3</Text>
                <Text style={styles.productNameSmall}>Cigarrillos</Text>
                <Text style={styles.productSales}>32 ventas</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Menú Lateral */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity 
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuContainer}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menú Principal</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setMenuVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color="#035c70" />
                </TouchableOpacity>
              </View>
              
              <MenuItem 
                icon="inventory" 
                title="Productos" 
                onPress={() => {
                  setMenuVisible(false);
                  // navigation.navigate('Products');
                }} 
              />
              <MenuItem 
                icon="point-of-sale" 
                title="Ventas" 
                onPress={() => {
                  setMenuVisible(false);
                  // navigation.navigate('Sales');
                }} 
              />
              <MenuItem 
                icon="local-shipping" 
                title="Proveedores" 
                onPress={() => {
                  setMenuVisible(false);
                  // navigation.navigate('Suppliers');
                }} 
              />
              <MenuItem 
                icon="settings" 
                title="Configuración" 
                onPress={() => {
                  setMenuVisible(false);
                  // navigation.navigate('Settings');
                }} 
              />
              
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
                <MaterialIcons name="logout" size={24} color="#E74C3C" />
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal de Perfil ACTUALIZADO CON FOTO */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={profileModalVisible}
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.profileOverlay}
            activeOpacity={1}
            onPress={() => setProfileModalVisible(false)}
          >
            <View style={styles.profileModal}>
              {/* Información del usuario - ACTUALIZADO CON FOTO */}
              {(userData || firestoreData) && (
                <View style={styles.profileInfo}>
                  {renderProfileImage()}
                  <Text style={styles.profileName}>
                    {getFullName()}
                  </Text>
                  <Text style={styles.profileEmail}>
                    {userData?.email || firestoreData?.email || ""}
                  </Text>
                  {firestoreData && firestoreData.foto_perfil && (
                    <Text style={styles.profileUpdated}>
                      ✓ Foto de perfil
                    </Text>
                  )}
                  {firestoreData && !firestoreData.foto_perfil && (
                    <Text style={styles.profileUpdated}>
                      ✓ Perfil actualizado
                    </Text>
                  )}
                </View>
              )}
              
              {/* Opciones del perfil - ACTUALIZADO */}
              <TouchableOpacity 
                style={styles.profileOption}
                onPress={handleViewProfile}
              >
                <MaterialIcons name="visibility" size={20} color="#035c70" />
                <Text style={styles.profileOptionText}>Ver perfil</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.profileOption}
                onPress={handleLogOut}
              >
                <MaterialIcons name="logout" size={20} color="#E74C3C" />
                <Text style={[styles.profileOptionText, styles.logoutText]}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
    backgroundColor: 'rgba(3, 92, 112, 0.9)',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  storeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 15,
    paddingTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#035c70',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  sectionContainer: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#035c70',
    marginBottom: 15,
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  },
  salesList: {
    marginTop: 10,
  },
  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  saleInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  saleTime: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  saleAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ED573',
  },
  productsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#035c70',
    marginBottom: 5,
  },
  productNameSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  productSales: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 2,
  },
  // Menú lateral
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  menuContainer: {
    width: width * 0.75,
    height: '100%',
    backgroundColor: 'white',
    paddingTop: 50,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#035c70',
  },
  closeButton: {
    padding: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  menuText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  logoutText: {
    fontSize: 16,
    color: '#E74C3C',
    marginLeft: 15,
    fontWeight: '600',
  },
  // Estilos del modal de perfil ACTUALIZADO CON FOTO
  profileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  profileModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  // NUEVO: Estilo para la imagen de perfil en el modal
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#035c70',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#035c70',
    marginTop: 5,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  profileUpdated: {
    fontSize: 10,
    color: '#12B05B',
    marginTop: 4,
    fontWeight: '600',
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  profileOptionText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 10,
    fontWeight: '500',
  },
  logoutText: {
    color: '#E74C3C',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECF0F1',
    marginVertical: 5,
  },
});