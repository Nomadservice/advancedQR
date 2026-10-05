import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';

export default function QRGenerator({ isPremium, hasAdReward, setHasAdReward, setShowPaywall, history, saveHistory }) {
  const [text, setText] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [isDynamic, setIsDynamic] = useState(false);
  const [logoUri, setLogoUri] = useState(null);

  useEffect(() => {
    if (text.trim()) {
      const isLoggedBefore = history.some(h => h.id === 'current-editing');
      const finalValue = isDynamic ? `https://qr-pro-dynamic/free-${Date.now()}` : text;
      
      const newElement = {
        id: Date.now().toString(),
        data: finalValue,
        type: isDynamic ? 'Dinamico' : 'Statico',
        date: new Date().toLocaleDateString()
      };
      
      if (!isLoggedBefore) {
        saveHistory([newElement, ...history]);
      }
    }
  }, [text, isDynamic]);

  const checkAccessAndExecute = (successCallback) => {
    if (isPremium) {
      successCallback();
      return;
    }
    if (hasAdReward) {
      successCallback();
      setHasAdReward(false); 
      Alert.alert("Gettone Consumato", "Operazione Premium completata. Guarda un altro Ad per sbloccarne altre!");
      return;
    }
    setShowPaywall(true);
  };

  const pickLogoImage = async () => {
    checkAccessAndExecute(async () => {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permesso Negato", "Devi consentire l'accesso alla galleria per inserire un logo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect:,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLogoUri(result.assets[0].uri);
      }
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Inserisci il link o il testo..."
        placeholderTextColor="#4E5D78"
        value={text}
        onChangeText={setText}
      />

      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.toggleBtn, isDynamic && styles.toggleAct]} 
          onPress={() => {
            const nextState = !isDynamic;
            if (nextState) {
              checkAccessAndExecute(() => setIsDynamic(true));
            } else {
              setIsDynamic(false);
            }
          }}
        >
          <Text style={styles.whiteTxt}>{isDynamic ? '🔗 Dynamic Link Active' : '🔒 Upgrade to Dynamic'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Logo Centrale:</Text>
      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.toggleBtn, logoUri && styles.toggleAct, { marginRight: logoUri ? 10 : 0 }]}
          onPress={pickLogoImage}
        >
          <Text style={styles.whiteTxt}>{logoUri ? '🖼️ Change Brand Logo' : '📁 Upload Central Logo'}</Text>
        </TouchableOpacity>
        
        {logoUri && (
          <TouchableOpacity 
            style={styles.removeBtn}
            onPress={() => setLogoUri(null)}
          >
            <Text style={styles.removeBtnT}>Rimuovi</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionLabel}>Personalizza Colore (Premium):</Text>
      <View style={styles.colorRow}>
        {['#000000', '#FF5733', '#20BF6B', '#3867D6'].map(c => (
          <TouchableOpacity 
            key={c} 
            style={[styles.colorDot, { backgroundColor: c }, qrColor === c && styles.colorDotAct]} 
            onPress={() => {
              if (c !== '#000000') {
                checkAccessAndExecute(() => setQrColor(c));
              } else {
                setQrColor(c);
              }
            }}
          />
        ))}
      </View>

      {text.trim() ? (
        <View style={styles.qrBox}>
          <QRCode 
            value={isDynamic ? `https://qr-pro-dynamic/free-preview` : text} 
            size={180} 
            color={qrColor} 
            backgroundColor="#FFF"
            logo={logoUri ? { uri: logoUri } : null}
            logoSize={42}
            logoBackgroundColor='white'
            logoBorderRadius={8}
          />
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Digita qualcosa per vedere l'anteprima in tempo reale</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  input: { backgroundColor: '#141929', color: '#FFF', padding: 18, borderRadius: 16, marginBottom: 20, fontSize: 15, borderWidth: 1, borderColor: '#1F273D' },
  row: { flexDirection: 'row', marginBottom: 15 },
  toggleBtn: { backgroundColor: '#141929', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#1F273D', flex: 1, alignItems: 'center' },
  toggleAct: { backgroundColor: '#00ADB5', borderColor: '#00ADB5' },
  removeBtn: { backgroundColor: '#291419', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#4A1D24', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 },
  removeBtnT: { color: '#FF5C5C', fontWeight: '700', fontSize: 14 },
  whiteTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  sectionLabel: { color: '#637394', marginBottom: 10, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  colorRow: { flexDirection: 'row', marginBottom: 25 },
  colorDot: { width: 40, height: 40, borderRadius: 20, marginRight: 15, borderWidth: 3, borderColor: '#141929' },
  colorDotAct: { borderColor: '#00ADB5' },
  qrBox: { marginTop: 10, alignItems: 'center', backgroundColor: '#FFF', padding: 24, borderRadius: 24, width: 228, alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 10 },
  emptyBox: { marginTop: 10, height: 228, borderStyle: 'dashed', borderWidth: 2, borderColor: '#1F273D', borderRadius: 24, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#4E5D78', textAlign: 'center', fontSize: 14, fontWeight: '600' }
});
