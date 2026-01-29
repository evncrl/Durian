import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import styles from "../styles/Flower.styles";

const Flower: React.FC = () => {
  const handleUploadPress = () => {
    // placeholder: later we will connect image picker
    console.log("Upload button pressed");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Upload Durian Flower Photo</Text>

        <TouchableOpacity style={styles.uploadArea} onPress={handleUploadPress}>
          <Text style={styles.uploadText}>Tap here to upload photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleUploadPress}>
          <Text style={styles.buttonText}>Select Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Flower;
