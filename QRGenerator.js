import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function QRGenerator({ isPremium, setShowPaywall, history, saveHistory }) {
  const [text, setText] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [logoOption, setLogoOption] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Generale');
  const [isDynamic, setIsDynamic] = useState(false);
  let svgRef = React.createRef();

  const handlePremiumRequirement = (action) => { 
    if (isPremium) {
      action();
    } else {
      setShowPaywall(true); 
    }
  };

  const handleGenerate = () => {
    if (!text) return;
    
    // Logica commerciale: se NON è premium, marchiamo il QR dinamico come temporaneo
    let prefix = isPremium ? 'active-' : 'free-';
    let val = isDynamic ? `https://api.qr-pro-dynamic{prefix}${Date.now()}` : text;
    
    const updatedHistory = [
      { id: Date.now().toString(), data: val, type: isDynamic ? 'Dinamico' : 'Generato', category: selectedCategory, date: new Date().toLocaleDateString() },
      ...history
    ];
    saveHistory(updatedHistory);
    
    if (isDynamic && !isPremium) {
      Alert.alert('Attenzione', 'Hai creato un QR Dinamico temporaneo. Scadrà tra 24 ore a meno che non ti abboni.');
    } else {
      Alert.alert('Successo', 'Codice QR Generato con successo.');
    }
  };

  const handleExportProcess = () => {
    // Il download è libero per i QR statici base neri, blocca se usano loghi o colori pro
    if (isPremium || (!logoOption && qrColor === '#000000')) {
      executeDownload();
    } else {
      Alert.alert(
        "Elementi Premium Rilevati",
        "Hai inserito colori o loghi personalizzati. Per scaricare questa configurazione devi sbloccare il piano Premium.",
        [
          { text: "Vedi Abbonamenti", onPress: () => setShowPaywall(true) },
          { text: "Annulla", style: "cancel" }
        ]
      );
    }
  };

  const executeDownload = () => {
    if (svgRef.current) {
      svgRef.current.toDataURL(async (dataURL) => {
        try {
          const filename = `${FileSystem.documentDirectory}qr_${Date.now()}.png`;
          await FileSystem.writeAsStringAsync(filename, dataURL, { encoding: FileSystem.EncodingType.Base64 });
          
          const asset = await MediaLibrary.createAssetAsync(filename);
          await MediaLibrary.createAlbumAsync('AdvancedQR', asset, false);
          
          Alert.alert("Successo", "QR salvato correttamente nella tua Galleria nella cartella 'AdvancedQR'!");
        } catch (e) {
          Alert.alert("Errore", "Impossibile salvare il file multimediale. Controlla i permessi.");
        }
      });
    }
  };

  return (
    <ScrollView style={styles.pad}>
      <TextInput 
        style={styles.input} 
        placeholder="Inserisci il link o testo..." 
        placeholderTextColor="#888" 
        value={text} 
        onChangeText={setText} 
      />
      
      <Text style={styles.sectionLabel}>Tipo di Codice:</Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.badge, !isDynamic && styles.badgeAct]} onPress={() => setIsDynamic(false)}>
          <Text style={styles.whiteTxt}>Statico</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.badge, isDynamic && styles.badgePro]} onPress={() => setIsDynamic(true)}>
          <Text style={styles.whiteTxt}>🔗 Dinamico {!isPremium ? '(Scadenza 24h)' : '(Pro)'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Categoria:</Text>
      <View style={styles.row}>
        {['Generale', 'Lavoro', 'Social'].map(c => (
          <TouchableOpacity key={c} style={[styles.badge, selectedCategory === c && styles.badgeAct]} onPress={() => setSelectedCategory(c)}>
            <Text style={styles.whiteTxt}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleGenerate}>
        <Text style={styles.btnTxt}>Crea Codice QR</Text>
      </TouchableOpacity>

      {text !== '' && (
        <View style={styles.qrBox}>
          <View style={styles.whiteCard}>
            <QRCode 
              value={text} 
              size={150} 
              color={qrColor} 
              backgroundColor="#FFF" 
              getRef={svgRef} 
              logo={{ uri: 'https://reactnative.dev' }} 
              logoSize={logoOption ? 30 : 0} 
              logoBackgroundColor="white"
              logoBorderRadius={8}
            />
          </View>
          
          <View style={styles.proBox}>
            <Text style={styles.sectionLabel}>🎨 Colori Personalizzati (Pro):</Text>
            <View style={styles.row}>
              {['#000000', '#FF5733', '#1A5F7A', '#57C5B6', '#8B5CF6'].map(col => (
                <TouchableOpacity 
                  key={col} 
                  style={[styles.circle, { backgroundColor: col }, qrColor === col && styles.selCircle]} 
                  onPress={() => handlePremiumRequirement(() => setQrColor(col))} 
                />
              ))}
            </View>

            <TouchableOpacity style={styles.proBtn} onPress={() => handlePremiumRequirement(() => setLogoOption(!logoOption))}>
              <Text style={styles.proBtnTxt}>{logoOption ? '❌ Rimuovi Logo' : '🖼️ Inserisci Logo Centrale (Pro)'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={handleExportProcess}>
              <Text style={styles.btnTxt}>💾 Scarica in Galleria</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { flex: 1, paddingHorizontal: 15 },
  sectionLabel: { color: '#E2E8F0', fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#161B26', color: '#FFF', padding: 16, borderRadius: 14, marginBottom: 15, fontSize: 15, borderWidth: 1, borderColor: '#2D3748' },
  row: { flexDirection: 'row', marginBottom: 15, flexWrap: 'wrap' },
  badge: { backgroundColor: '#161B26', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#2D3748' },
  badgeAct: { backgroundColor: '#00ADB5', borderColor: '#00ADB5' },
  badgePro: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' }, 
  btn: { backgroundColor: '#00ADB5', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 10, width: '100%' },
  btnTxt: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  whiteCard: { padding: 20, backgroundColor: '#FFF', borderRadius: 20 },
  qrBox: { alignItems: 'center', marginTop: 15, padding: 20, borderRadius: 18, backgroundColor: '#161B26', borderWidth: 1, borderColor: '#2D3748', width: '100%' },
  proBox: { width: '100%', marginTop: 20 },
  proBtn: { backgroundColor: '#1A202C', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#D4AF37', width: '100%' },
  proBtnTxt: { color: '#D4AF37', fontWeight: '700' },
  circle: { width: 34, height: 34, borderRadius: 17, marginRight: 12 },
  selCircle: { borderWidth: 3, borderColor: '#00ADB5' },
  whiteTxt: { color: '#A0AEC0', fontWeight: '600' }
});
