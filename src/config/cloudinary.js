// config/cloudinary.js
export const cloudinaryConfig = {
  cloudName: 'defnfaxwb',
  uploadPreset: 'ml_default'
};

// Función para subir imagen a Cloudinary
export const uploadToCloudinary = async (imageUri) => {
  try {
    console.log('🔄 Iniciando subida a Cloudinary...');
    console.log('📁 Cloud Name:', cloudinaryConfig.cloudName);
    console.log('⚙️ Upload Preset:', cloudinaryConfig.uploadPreset);
    console.log('🖼️ Image URI:', imageUri);

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg'
    });
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('cloud_name', cloudinaryConfig.cloudName);

    console.log('📤 Enviando request a Cloudinary...');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    const data = await response.json();
    console.log('📄 Response data:', data);

    if (data.secure_url) {
      console.log('✅ Imagen subida exitosamente:', data.secure_url);
      return data.secure_url;
    } else {
      console.error('❌ Error de Cloudinary:', data);
      throw new Error(data.error?.message || 'Error al subir imagen');
    }
  } catch (error) {
    console.error('💥 Error completo subiendo a Cloudinary:', error);
    throw error;
  }
};