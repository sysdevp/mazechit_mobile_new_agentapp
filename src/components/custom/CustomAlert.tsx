import React from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const CustomAlert = ({
  visible,
  type = "error",
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  const config = {
    error: {
      color: "#E53935",
      icon: "delete",
    },
    info: {
      color: "#1976D2",
      icon: "thumb-up",
    },
  };

  const { color, icon } = config[type];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          {/* Icon Circle */}
          <View style={[styles.iconCircle, { backgroundColor: color }]}>
            <Icon name={icon} size={32} color="#fff" />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, { backgroundColor: color }]}
              onPress={onConfirm}
            >
              <Text style={styles.buttonText}>Update</Text>
            </Pressable>

            {onCancel && (
              <Pressable style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>Later</Text>
              </Pressable>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: "center",
  },

  iconCircle: {
    position: "absolute",
    top: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
  },

  message: {
    textAlign: "center",
    paddingHorizontal: 20,
    color: "#666",
    marginBottom: 20,
  },

  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },

  button: {
    width: "80%",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  cancelButton: {
    width: "80%",
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
  },

  cancelText: {
    color: "#333",
  },
});