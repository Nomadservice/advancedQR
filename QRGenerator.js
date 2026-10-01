import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QRGenerator({ isPremium, setShowPaywall, history, saveHistory }) {
  const [text, setText] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [isDynamic, setIsDynamic] = useState(false);

  const handleGenerate = () => {
    if (!text.trim()) {
      Alert.alert("Errore", "Inserisci un testo o un URL valido.");
      return;
    }

    if (isDynamic && !isPremium) {
      setShowPaywall(true);
      return;
    }

    let finalValue = text;
    if (isDynamic) {
      finalValue = `https://qr-pro-dynamic/free-${Date.now()}`;
    }

    setQrValue(finalValue);

    const newElement = {
      id: Date.now().toString(),
      data: finalValue,
      type: isDynamic ? 'Dinamico' : 'Statico',
      category: 'Lavoro',
      date: new Date().toLocaleDateString()
    };

    saveHistory([newElement, ...history]);
  };

  const handleColorChange = (color) => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    setQrColor(color);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Inserisci il link o il testo..."
        placeholderTextColor="#718096"
        value={text}
        onChangeText={setText}
      />

      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.toggleBtn, isDynamic && styles.toggleAct]} 
          onPress={() => setIsDynamic(!isDynamic)}
        >
          <Text style={styles.whiteTxt}>{isDynamic ? '🔗 QR Dinamico Attivo' : '🔒 Rendi Dinamico'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Personalizza Colore (Solo Pro):</Text>
      <View style={styles.colorRow}>
        {['#000000', '#FF5733', '#33FF57', '#3357FF'].map(c => (
          <TouchableOpacity 
            key={c} 
            style={[styles.colorDot, { backgroundColor: c }, qrColor === c && styles.colorDotAct]} 
            onPress={() => handleColorChange(c)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.genBtn} onPress={handleGenerate}>
        <Text style={styles.genBtnTxt}>Genera Codice QR</Text>
      </TouchableOpacity>

      {qrValue ? (
        <View style={styles.qrBox}>
          <QRCode value={qrValue} size={180} color={qrColor} backgroundColor="#FFF" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 15 },
  input: { backgroundColor: '#161B26', color: '#FFF', padding: 16, borderRadius: 14, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#2D3748' },
  row: { flexDirection: 'row', marginBottom: 15 },
  toggleBtn: { backgroundColor: '#161B26', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#2D3748', flex: 1, alignItems: 'center' },
  toggleAct: { backgroundColor: '#00ADB5', borderColor: '#00ADB5' },
  whiteTxt: { color: '#FFF', fontWeight: '600' },
  sectionLabel: { color: '#A0AEC0', marginBottom: 10, fontWeight: '600' },
  colorRow: { flexDirection: 'row', marginBottom: 20 },
  colorDot: { width: 36, height: 36, borderRadius: 18, marginRight: 12, borderWidth: 2, borderColor: '#161B26' },
  colorDotAct: { borderColor: '#00ADB5' },
  genBtn: { backgroundColor: '#00ADB5', padding: 16, borderRadius: 14, alignItems: 'center' },
  genBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  qrBox: { marginTop: 25, alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 16, selfAlign: 'center' }
});
