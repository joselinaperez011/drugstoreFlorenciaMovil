// services/imageService.js
import * as ImagePicker from 'expo-image-picker';

export class ImageService {
  
  // 1. Método para seleccionar imagen
  static async pickImage() {
    try {
      // Pedir permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos para acceder a la galería');
        return null;
      }

      // Abrir selector de imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Foto cuadrada
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.log('Error al seleccionar imagen:', error);
      return null;
    }
  }

  // 2. Método DIRECTO para subir a Cloudinary (SIN SDK)
  static async uploadToCloudinary(imageUri) {
    try {
      // Crear FormData como lo espera Cloudinary
      const formData = new FormData();
      
      // Agregar la imagen
      formData.append('file', {
        uri: imageUri,           // URI de la imagen local
        type: 'image/jpeg',      // Tipo de archivo
        name: 'profile_photo.jpg' // Nombre del archivo
      });
      
      // Agregar upload preset (IMPORTANTE)
      formData.append('upload_preset', 'tu_upload_preset');
      
      // Agregar cloud name (IMPORTANTE)
      formData.append('cloud_name', 'tu_cloud_name');

      // Hacer la petición DIRECTAMENTE a la API de Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/tu_cloud_name/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Procesar la respuesta
      const data = await response.json();
      
      if (data.secure_url) {
        return data.secure_url; // URL de la imagen en Cloudinary
      } else {
        console.log('Error de Cloudinary:', data);
        throw new Error(data.error?.message || 'Error al subir imagen');
      }
    } catch (error) {
      console.log('Error subiendo a Cloudinary:', error);
      throw error;
    }
  }

  // 3. Función completa que usa ambos métodos
  static async selectAndUploadImage() {
    try {
      // Paso 1: Seleccionar imagen con ImagePicker
      console.log('Seleccionando imagen...');
      const image = await this.pickImage();
      if (!image) {
        console.log('Usuario canceló la selección');
        return null;
      }

      // Paso 2: Subir a Cloudinary (MÉTODO DIRECTO)
      console.log('Subiendo imagen a Cloudinary...');
      const imageUrl = await this.uploadToCloudinary(image.uri);
      console.log('Imagen subida exitosamente:', imageUrl);
      
      return imageUrl;
      
    } catch (error) {
      console.log('Error en proceso completo:', error);
      throw error;
    }
  }
}