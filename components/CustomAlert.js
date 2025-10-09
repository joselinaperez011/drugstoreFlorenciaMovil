// components/CustomAlert.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  type = 'info', 
  onConfirm,
  confirmText = "Aceptar"
}) => {
  const getTheme = () => {
    switch(type) {
      case 'success':
        return { bg: '#7ccc3bff', text: 'white' };
      case 'error':
        return { bg: '#1B88B8', text: 'white' };
      case 'info':
        return { bg: '#f3a23eff', text: 'white' };
      case 'warning':
        return { bg: '#FFC680', text: 'white' };
      default:
        return { bg: '#3498DB', text: 'white' };
    }
  };

  const theme = getTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onConfirm}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.bg }]}>
            <Text style={styles.icon}>{theme.icon}</Text>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>
          
          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.bg }]}
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '100%',
    maxWidth: 350,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  body: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomAlert;