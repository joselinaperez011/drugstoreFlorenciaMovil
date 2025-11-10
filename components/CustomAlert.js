// components/CustomAlert.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  type = 'info', 
  onConfirm,
  confirmText = "Aceptar",
  showCancel = false,
  onCancel,
  cancelText = "Cancelar"
}) => {
  const getTheme = () => {
    switch(type) {
      case 'success':
        return { 
          bg: '#12B05B',
          icon: 'check-circle',
          iconColor: 'white'
        };
      case 'error':
        return { 
          bg: '#E74C3C',
          icon: 'error',
          iconColor: 'white'
        };
      case 'info':
        return { 
          bg: '#035c70',
          icon: 'info',
          iconColor: 'white'
        };
      case 'warning':
        return { 
          bg: '#f3a23eff',
          icon: 'warning',
          iconColor: 'white'
        };
      default:
        return { 
          bg: '#035c70',
          icon: 'info',
          iconColor: 'white'
        };
    }
  };

  const theme = getTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Título */}
          <Text style={styles.modalTitle}>{title}</Text>
          
          {/* Mensaje */}
          <Text style={styles.modalText}>{message}</Text>
          
          {/* Icono según el tipo */}
          <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
            <MaterialIcons name={theme.icon} size={32} color={theme.iconColor} />
          </View>

          {/* Botones */}
          <View style={styles.modalButtons}>
            {showCancel && (
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.bg }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
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
    marginBottom: 20,
    lineHeight: 22,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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

export default CustomAlert;