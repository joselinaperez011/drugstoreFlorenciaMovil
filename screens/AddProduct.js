import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  Image,
  Platform,
  FlatList,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../src/config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function AddProduct({ navigation }) {
  const [productData, setProductData] = useState({
    nombre: '',
    precio: '',
    cantidad: '',
    categoria: '',
    descripcion: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Lista de categorías
  const categories = [
    'Limpieza',
    'Lácteos',
    'Golosinas',
    'Despensa',
    'Bebidas',
    'Congelados'
  ];

  const handleInputChange = (field, value) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (category) => {
    handleInputChange('categoria', category);
    setShowCategoryPicker(false);
  };

  // FUNCIÓN CORREGIDA CON TUS DATOS DE CLOUDINARY
  const uploadToCloudinary = async (imageUri) => {
    try {
      console.log('📸 Iniciando subida a Cloudinary...');
      
      const formData = new FormData();
      
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'product.jpg'
      });
      
      // 🔽 USANDO TUS DATOS REALES
      const cloudName = 'defnfaxwb';
      const uploadPreset = 'ml_default'; // 👈 TU UPLOAD PRESET CORRECTO
      
      formData.append('upload_preset', uploadPreset);
      formData.append('cloud_name', cloudName);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
        console.log('✅ Imagen subida exitosamente a Cloudinary');
        return data.secure_url;
      } else {
        console.log('❌ Error de Cloudinary:', data);
        throw new Error(data.error?.message || 'Error al subir imagen');
      }
    } catch (error) {
      console.log('Error subiendo a Cloudinary:', error);
      throw error;
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una imagen.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleAddProduct = async () => {
    if (!productData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del producto es requerido');
      return;
    }

    if (!productData.precio || isNaN(parseFloat(productData.precio))) {
      Alert.alert('Error', 'El precio debe ser un número válido');
      return;
    }

    if (!productData.categoria.trim()) {
      Alert.alert('Error', 'La categoría es requerida');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';
      
      // SUBIR IMAGEN A CLOUDINARY SI HAY UNA SELECCIONADA
      if (image) {
        imageUrl = await uploadToCloudinary(image);
      }

      const productToSave = {
        nombre: productData.nombre.trim(),
        precio: parseFloat(productData.precio),
        cantidad: productData.cantidad.trim(),
        categoria: productData.categoria.trim(),
        descripcion: productData.descripcion.trim(),
        imagen: imageUrl, // URL de Cloudinary o string vacío
        fechaCreacion: new Date(),
        activo: true
      };

      await addDoc(collection(db, 'products'), productToSave);

      Alert.alert('Éxito', 'Producto agregado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error agregando producto:', error);
      Alert.alert('Error', 'No se pudo agregar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (productData.nombre || productData.precio || productData.categoria || image) {
      Alert.alert('Cancelar', '¿Estás seguro de que quieres cancelar? Se perderán los datos no guardados.', [
        { text: 'No', style: 'cancel' },
        { text: 'Sí', onPress: () => navigation.goBack() }
      ]);
    } else {
      navigation.goBack();
    }
  };

  // Renderizar cada campo del formulario
  const renderFormField = () => {
    return (
      <>
        {/* NOMBRE */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={productData.nombre}
            onChangeText={(value) => handleInputChange('nombre', value)}
            placeholder="Ingrese el nombre del producto"
            placeholderTextColor="#999"
          />
        </View>

        {/* PRECIO */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Precio *</Text>
          <TextInput
            style={styles.input}
            value={productData.precio}
            onChangeText={(value) => handleInputChange('precio', value)}
            placeholder="Ingrese el precio"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* CANTIDAD */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cantidad</Text>
          <TextInput
            style={styles.input}
            value={productData.cantidad}
            onChangeText={(value) => handleInputChange('cantidad', value)}
            placeholder="Ingrese la cantidad"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* CATEGORÍA */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categoría *</Text>
          <TouchableOpacity 
            style={styles.categorySelector}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text 
              style={productData.categoria ? styles.categorySelectedText : styles.categoryPlaceholderText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {productData.categoria || 'Seleccionar categoría'}
            </Text>
            <MaterialIcons 
              name={showCategoryPicker ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#035c70" 
            />
          </TouchableOpacity>

          {showCategoryPicker && (
            <View style={styles.categoryPickerContainer}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryOption,
                    productData.categoria === category && styles.categoryOptionSelected
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    productData.categoria === category && styles.categoryOptionTextSelected
                  ]}>
                    {category}
                  </Text>
                  {productData.categoria === category && (
                    <MaterialIcons name="check" size={20} color="#035c70" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* DESCRIPCIÓN */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descripción del producto</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={productData.descripcion}
            onChangeText={(value) => handleInputChange('descripcion', value)}
            placeholder="Descripción detallada del producto..."
            placeholderTextColor="#999"
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </>
    );
  };

  return (
    <ImageBackground source={require('../assets/fondo.jpeg')} style={styles.backgroundImage} resizeMode="cover">
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agregar Producto</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <FlatList
          data={[{key: 'form'}]}
          keyExtractor={(item) => item.key}
          renderItem={() => (
            <View style={styles.formContainer}>
              {renderFormField()}
              
              {/* SECCIÓN DE IMAGEN */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Agregar Imagen (Opcional)</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                  {image ? (
                    <Image source={{ uri: image }} style={styles.selectedImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <MaterialIcons name="add-a-photo" size={40} color="#035c70" />
                      <Text style={styles.imagePlaceholderText}>Seleccionar imagen</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {image && (
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
                    <MaterialIcons name="delete" size={20} color="#E74C3C" />
                    <Text style={styles.removeImageText}>Eliminar imagen</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.addButton, loading && styles.disabledButton]}
                  onPress={handleAddProduct}
                  disabled={loading}
                >
                  <Text style={styles.addButtonText}>{loading ? 'Agregando...' : 'Agregar'}</Text>
                </TouchableOpacity>
              </View>
              
              {Platform.OS === 'ios' && <View style={styles.iosSpacer} />}
            </View>
          )}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { 
    flex: 1, 
    width: '100%', 
    height: '100%' 
  },
  container: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(3, 92, 112, 0.9)',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  backButton: { 
    padding: 5 
  },
  headerTitle: { 
    flex: 1, 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: 'white', 
    textAlign: 'center' 
  },
  headerPlaceholder: { 
    width: 34 
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 15,
    margin: 20,
    paddingBottom: 20,
  },
  inputContainer: { 
    marginBottom: 20
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#035c70', 
    marginBottom: 8 
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 50, // Altura mínima consistente
  },
  multilineInput: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  // Estilos para el selector de categoría - CORREGIDOS
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    minHeight: 50, // Misma altura que los otros inputs
  },
  categorySelectedText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1, // Ocupa todo el espacio disponible
    marginRight: 10, // Espacio para la flecha
  },
  categoryPlaceholderText: {
    fontSize: 16,
    color: '#999',
    flex: 1, // Ocupa todo el espacio disponible
    marginRight: 10, // Espacio para la flecha
  },
  categoryPickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 250, // Más alto para mostrar todas las opciones
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Más padding vertical
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    minHeight: 40, // Altura suficiente para cada opción
  },
  categoryOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1, // Ocupa todo el espacio disponible
    marginRight: 10, // Espacio para el checkmark
  },
  categoryOptionTextSelected: {
    color: '#035c70',
    fontWeight: '600',
  },
  // Estilos para imagen
  imagePicker: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePlaceholder: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  imagePlaceholderText: { 
    marginTop: 8, 
    color: '#035c70', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  selectedImage: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  removeImageButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 10 
  },
  removeImageText: { 
    color: '#E74C3C', 
    marginLeft: 5, 
    fontSize: 14, 
    fontWeight: '500' 
  },
  buttonsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 20,
    marginBottom: 10 
  },
  button: { 
    flex: 1, 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  cancelButton: { 
    backgroundColor: 'white', 
    borderWidth: 2, 
    borderColor: '#E74C3C', 
    marginRight: 10 
  },
  addButton: { 
    backgroundColor: '#035c70', 
    marginLeft: 10 
  },
  disabledButton: { 
    backgroundColor: '#7F8C8D', 
    opacity: 0.6 
  },
  cancelButtonText: { 
    color: '#E74C3C', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  addButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  iosSpacer: {
    height: 50,
  },
});