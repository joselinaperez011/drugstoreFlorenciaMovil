import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView,
  Dimensions,
  Modal,
  BackHandler,
  ImageBackground
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { db } from '../src/config/firebaseConfig';
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Circle, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Componente para el saludo del usuario
const UserGreeting = ({ userName }) => (
  <View style={styles.greetingContainer}>
    <Text style={styles.greetingText}>Hola, {userName}!</Text>
    <Text style={styles.greetingSubtitle}>Inicio</Text>
  </View>
);

// Componente para las tarjetas del dashboard
const DashboardCards = ({ navigation }) => {
  const cards = [
    {
      id: 1,
      title: 'Productos',
      icon: 'inventory',
      onPress: () => navigation.navigate('Products'),
      color: '#00797B'
    },
    {
      id: 2,
      title: 'Caja',
      icon: 'payments',
      onPress: () => console.log('Caja presionada'),
      color: '#00797B'
    },
    {
      id: 3,
      title: 'Venta',
      icon: 'shopping-cart',
      onPress: () => console.log('Venta presionada'),
      color: '#00797B'
    },
    {
      id: 4,
      title: 'Empleados',
      icon: 'people',
      onPress: () => console.log('Empleados presionado'),
      color: '#00797B'
    }
  ];

  return (
    <View style={styles.cardsContainer}>
      {cards.map((card) => (
        <TouchableOpacity
          key={card.id}
          style={styles.card}
          onPress={card.onPress}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <MaterialIcons 
              name={card.icon} 
              size={30} 
              color={card.color} 
              style={styles.cardIcon}
            />
            <Text style={styles.cardText} numberOfLines={2} adjustsFontSizeToFit>
              {card.title}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Componente para los botones del menú principal
const MainMenuButtons = ({ navigation }) => (
  <View style={styles.menuButtonsContainer}>
    <DashboardCards navigation={navigation} />
  </View>
);

// Componente para las estadísticas de productos
const ProductStats = ({ totalProducts }) => {
  const productCards = [
    {
      id: 1,
      title: 'Total de productos',
      value: totalProducts,
    },
    {
      id: 2,
      title: 'Productos vendidos',
      value: 0,
    }
  ];

  return (
    <View style={styles.productStatsContainer}>
      <Text style={styles.productStatsTitle}>Productos</Text>
      <View style={styles.productCardsContainer}>
        {productCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.productCard}
            activeOpacity={0.7}
          >
            <View style={styles.productCardContent}>
              <Text style={styles.productCardValue}>{card.value}</Text>
              <Text style={styles.productCardLabel}>{card.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Componente para las categorías con pie chart REAL
const CategoriesList = ({ categories }) => {
  // Paleta de colores
  const categoryColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
  
  // Datos de ejemplo basados en tu imagen
  const displayCategories = categories.length > 0 ? categories.slice(0, 4) : [
    { name: 'Limpieza', percentage: '16.7' },
    { name: 'Bebidas', percentage: '16.7' },
    { name: 'Golosinas', percentage: '16.7' },
    { name: 'Congelados', percentage: '16.7' }
  ];

  // Calcular los segmentos del pie chart
  const calculateSegments = () => {
    const segments = [];
    let currentAngle = 0;
    
    displayCategories.forEach((category, index) => {
      const percentage = parseFloat(category.percentage) || 0;
      const angle = (percentage / 100) * 360;
      const color = categoryColors[index % categoryColors.length];
      
      segments.push({
        percentage,
        angle,
        startAngle: currentAngle,
        color,
        name: category.name
      });
      
      currentAngle += angle;
    });
    
    return segments;
  };

  const segments = calculateSegments();
  const size = 100;
  const radius = size / 2;
  const circumference = 2 * Math.PI * (radius - 2);

  return (
    <View style={styles.categoriesContainer}>
      <Text style={styles.categoriesTitle}>Categorías</Text>
      
      <View style={styles.categoriesContent}>
        {/* Pie Chart REAL con SVG */}
        <View style={styles.pieChartContainer}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G rotation="-90" origin={`${radius}, ${radius}`}>
              {segments.map((segment, index) => {
                const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;
                
                return (
                  <Circle
                    key={index}
                    cx={radius}
                    cy={radius}
                    r={radius - 2}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={4}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset="0"
                    rotation={segment.startAngle}
                    origin={`${radius}, ${radius}`}
                  />
                );
              })}
            </G>
          </Svg>
        </View>

        {/* Leyenda de categorías */}
        <View style={styles.legendContainer}>
          {displayCategories.map((category, index) => {
            const color = categoryColors[index % categoryColors.length];
            return (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <View style={styles.legendTextContainer}>
                  <Text style={styles.legendPercentage}>{category.percentage}%</Text>
                  <Text style={styles.legendName}>{category.name}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

// Componente para los últimos productos (estilo lista)
const RecentProducts = ({ products }) => {
  const lastProducts = products.slice(-3).reverse();
  
  return (
    <View style={styles.recentProductsContainer}>
      <Text style={styles.recentProductsTitle}>Últimos productos creados</Text>
      <View style={styles.productsList}>
        {lastProducts.length > 0 ? (
          lastProducts.map((product) => (
            <View key={product.id} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.nombre || 'Sin nombre'}
                </Text>
                <Text style={styles.productPrice}>
                  ${product.precio ? product.precio.toLocaleString() : '0'}
                </Text>
              </View>
              {product.imagen ? (
                <Image 
                  source={{ uri: product.imagen }} 
                  style={styles.productThumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <MaterialIcons name="inventory" size={20} color="#7F8C8D" />
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noProductsText}>No hay productos</Text>
        )}
      </View>
    </View>
  );
};

// Componente MenuItem para el modal - CON EL FORMATO SOLICITADO
const MenuItem = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <MaterialIcons name={icon} size={24} color="#035c70" />
    <Text style={styles.menuText}>{title}</Text>
  </TouchableOpacity>
);

export default function Home({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [firestoreData, setFirestoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
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

        await loadUserDataFromFirestore();
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (isFocused) {
      console.log('🔄 Home está enfocado, recargando productos...');
      loadProducts();
    }
  }, [isFocused]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      console.log('📦 Datos de productos actualizados en tiempo real');
      const productsData = [];
      const categoriesCount = {};
      
      snapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() };
        productsData.push(product);
        
        if (product.categoria) {
          categoriesCount[product.categoria] = (categoriesCount[product.categoria] || 0) + 1;
        }
      });
      
      setProducts(productsData);
      
      const totalProducts = productsData.length;
      const categoriesWithPercentages = Object.entries(categoriesCount).map(([name, count]) => ({
        name,
        count,
        percentage: totalProducts > 0 ? ((count / totalProducts) * 100).toFixed(1) : 0
      }));
      
      setCategories(categoriesWithPercentages);
    });

    return () => unsubscribe();
  }, []);

  const loadUserDataFromFirestore = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const firestoreUserData = userSnap.data();
        setFirestoreData(firestoreUserData);
      } else {
        await setDoc(doc(db, 'users', user.uid), {
          nombre: userData?.name || '',
          apellido: userData?.lastName || '',
          email: user.email || '',
          teléfono: '',
          dirección: '',
          fecha_de_nacimiento: '',
          dni: '',
          género: '',
          foto_perfil: '',
          fecha_creacion: new Date(),
          uid: user.uid
        });
      }
    } catch (error) {
      console.error('Error cargando datos de Firestore:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = [];
      const categoriesCount = {};
      
      querySnapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() };
        productsData.push(product);
        
        if (product.categoria) {
          categoriesCount[product.categoria] = (categoriesCount[product.categoria] || 0) + 1;
        }
      });
      
      setProducts(productsData);
      
      const totalProducts = productsData.length;
      const categoriesWithPercentages = Object.entries(categoriesCount).map(([name, count]) => ({
        name,
        count,
        percentage: totalProducts > 0 ? ((count / totalProducts) * 100).toFixed(1) : 0
      }));
      
      setCategories(categoriesWithPercentages);
      
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

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
    navigation.navigate('ViewProfile', { 
      userData: userData,
      firestoreData: firestoreData
    });
  };

  const getFullName = () => {
    if (firestoreData && firestoreData.nombre && firestoreData.apellido) {
      return `${firestoreData.nombre} ${firestoreData.apellido}`;
    }
    if (userData) {
      return `${userData.name} ${userData.lastName}`;
    }
    return "Usuario";
  };

  const getUserFirstName = () => {
    if (firestoreData && firestoreData.nombre) {
      return firestoreData.nombre;
    }
    if (userData) {
      return userData.name;
    }
    return "Usuario";
  };

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
            {getUserFirstName().charAt(0)}
          </Text>
        </View>
      );
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/fondo.jpeg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Header sobre el fondo */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <MaterialIcons name="menu" size={28} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setProfileModalVisible(true)}
        >
          <MaterialIcons name="person" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Contenido principal con card blanco */}
      <View style={styles.mainContent}>
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Saludo del usuario */}
          <UserGreeting userName={getUserFirstName()} />
          
          {/* Nuevas tarjetas minimalistas */}
          <MainMenuButtons navigation={navigation} />
          
          {/* Estadísticas de productos */}
          <ProductStats totalProducts={products.length} />
          
          {/* Categorías */}
          <CategoriesList categories={categories} />
          
          {/* Últimos productos */}
          <RecentProducts products={products} />
        </ScrollView>
      </View>

      {/* Modal del menú - CON LOS ITEMS EN EL FORMATO SOLICITADO */}
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
            
            {/* ITEMS CON EL FORMATO SOLICITADO */}
            <MenuItem 
              icon="inventory" 
              title="Productos" 
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Products');
              }} 
            />
            <MenuItem 
              icon="point-of-sale" 
              title="Caja" 
              onPress={() => {
                setMenuVisible(false);
                // navigation.navigate('Caja');
              }} 
            />
            <MenuItem 
              icon="shopping-cart" 
              title="Venta" 
              onPress={() => {
                setMenuVisible(false);
                // navigation.navigate('Venta');
              }} 
            />
            <MenuItem 
              icon="people" 
              title="Empleados" 
              onPress={() => {
                setMenuVisible(false);
                // navigation.navigate('Empleados');
              }} 
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal del perfil (con imagen restaurada) */}
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
            <View style={styles.profileInfo}>
              {renderProfileImage()}
              <Text style={styles.profileName}>{getFullName()}</Text>
              <Text style={styles.profileEmail}>
                {userData?.email || firestoreData?.email || ""}
              </Text>
            </View>
            
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  menuButton: {
    padding: 8,
  },
  profileButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  mainContent: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 'auto',
    minHeight: height * 0.8,
  },
  scrollContent: {
    flex: 1,
    padding: 25,
    paddingTop: 30,
  },

  // Saludo del usuario
  greetingContainer: {
    marginBottom: 30,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#7D7D7D',
  },

  // Nuevas tarjetas minimalistas
  menuButtonsContainer: {
    marginBottom: 30,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    width: (width - 70) / 4, // Divide el ancho disponible entre 4 tarjetas
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra suave para iOS
    shadowColor: '#00797B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Sombra suave para Android
    elevation: 4,
    // Borde sutil
    borderWidth: 1,
    borderColor: 'rgba(0, 121, 123, 0.1)',
    minHeight: 80, // Altura mínima para consistencia
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Asegura que ocupe todo el ancho de la tarjeta
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#00797B',
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 0.2,
  },

  // Nueva sección de estadísticas de productos con tarjetas
  productStatsContainer: {
    marginBottom: 25,
  },
  productStatsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    paddingLeft: 5,
  },
  productCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 70) / 2, // Mismo cálculo que las tarjetas principales
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra suave para iOS
    shadowColor: '#00797B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Sombra suave para Android
    elevation: 4,
    // Borde sutil
    borderWidth: 1,
    borderColor: 'rgba(0, 121, 123, 0.1)',
    minHeight: 100, // Altura ajustada sin ícono
  },
  productCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  productCardValue: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#087182',
    marginBottom: 8,
    textAlign: 'center',
  },
  productCardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#575757', // Color específico para el texto
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 0.2,
  },

  // Categorías con pie chart REAL
  categoriesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  categoriesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    // Sombra sutil para el gráfico
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendContainer: {
    flex: 1,
    marginLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  legendPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    minWidth: 50,
  },
  legendName: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  
  // Últimos productos
  recentProductsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  recentProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  productsList: {
    // Estilos para la lista de productos
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  productThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#ECF0F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProductsText: {
    textAlign: 'center',
    color: '#7D7D7D',
    fontStyle: 'italic',
    paddingVertical: 20,
  },

  // Estilos para modales
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
    fontSize: 20,
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