import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TextInput,
  Image,
  BackHandler,
  Alert,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { db } from '../src/config/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function Products({ navigation }) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    loadProducts();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    // Filtrar productos basado en la búsqueda
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoria?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = [];
      
      querySnapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() };
        productsData.push(product);
      });
      
      // Ordenar por fecha de creación (más recientes primero)
      productsData.sort((a, b) => new Date(b.fechaCreacion?.toDate()) - new Date(a.fechaCreacion?.toDate()));
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return `$${parseFloat(price).toLocaleString('es-AR')}`;
  };

  const formatQuantity = (quantity) => {
    if (!quantity) return '0 unidades';
    return `${quantity} unidades`;
  };

  const handleEditProduct = (product) => {
    // Navegar a la pantalla de edición (la crearemos después)
    navigation.navigate('EditProduct', { product });
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      setDeleteModalVisible(false);
      setProductToDelete(null);
      loadProducts(); // Recargar la lista
      Alert.alert('Éxito', 'Producto eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      Alert.alert('Error', 'No se pudo eliminar el producto');
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setProductToDelete(null);
  };

  const ProductCard = ({ product }) => (
    <View style={styles.productCard}>
      {/* Imagen del producto */}
      <View style={styles.imageContainer}>
        {product.imagen ? (
          <Image 
            source={{ uri: product.imagen }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="inventory" size={30} color="#7F8C8D" />
          </View>
        )}
      </View>

      {/* Información del producto */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.nombre || 'Sin nombre'}
        </Text>
        
        <Text style={styles.productPrice}>
          {formatPrice(product.precio)}
        </Text>
        
        <Text style={styles.productQuantity}>
          {formatQuantity(product.cantidad)}
        </Text>
        
        {product.descripcion ? (
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.descripcion}
          </Text>
        ) : product.categoria ? (
          <Text style={styles.productCategory}>
            {product.categoria}
          </Text>
        ) : null}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditProduct(product)}
        >
          <MaterialIcons name="edit" size={18} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(product)}
        >
          <MaterialIcons name="delete" size={18} color="white" />
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>PRODUCTOS</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar"
              placeholderTextColor="#7F8C8D"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color="#7F8C8D" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contador de productos */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Lista de productos */}
        <ScrollView 
          style={styles.productsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="inventory" size={60} color="#BDC3C7" />
              <Text style={styles.emptyStateTitle}>No se encontraron productos</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Agrega tu primer producto'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={styles.addProductButton}
                  onPress={() => navigation.navigate('AddProduct')}
                >
                  <MaterialIcons name="add" size={20} color="white" />
                  <Text style={styles.addProductButtonText}>Agregar Producto</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* Botón flotante para agregar producto */}
        {filteredProducts.length > 0 && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Modal de confirmación para eliminar */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={cancelDelete}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Eliminar Producto</Text>
              <Text style={styles.modalText}>
                ¿Estás seguro de que quieres eliminar "{productToDelete?.nombre}"? Esta acción no se puede deshacer.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={cancelDelete}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmDelete}
                >
                  <Text style={styles.confirmButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  counterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  counterText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#035c70',
  },
  imageContainer: {
    marginRight: 15,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#ECF0F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderStyle: 'dashed',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#12B05B',
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  productCategory: {
    fontSize: 13,
    color: '#035c70',
    fontWeight: '500',
  },
  // Nuevos estilos para los botones de acción
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#035c70',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#035c70',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  addProductButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#035c70',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  // Estilos para el modal de confirmación
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ECF0F1',
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  confirmButton: {
    backgroundColor: '#E74C3C',
  },
  cancelButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});