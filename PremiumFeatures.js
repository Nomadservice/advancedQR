import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export function Paywall({ setIsPremium, setShowPaywall, onWatchAd }) {
  return (
    <View style={styles.paywall}>
      <Text style={styles.paywallTitle}>⚡ Passa a Advanced QR Pro ⚡</Text>
      <Text style={styles.paywallSub}>Sblocca colori, loghi, QR dinamici e archivio illimitato</Text>
      
      {['🎨 Cambia colori e aggiungi Loghi', '🔗 Crea QR Dinamici modificabili', '📁 Archivio illimitato con Categorie', '💾 Esportazione in Alta Risoluzione SVG'].map((f, i) => (
        <Text key={i} style={styles.feat}>{f}</Text>
      ))}
      
      <TouchableOpacity style={styles.adBtn} onPress={onWatchAd}>
        <Text style={styles.adBtnT}>📺 Sblocca una funzione GRATIS guardando un Video</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.pBtn} onPress={() => { setIsPremium(true); setShowPaywall(false); }}>
        <Text style={styles.pBtnT}>Mensile - 1,99 € / mese (3gg gratis)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.pBtn} onPress={() => { setIsPremium(true); setShowPaywall(false); }}>
        <Text style={styles.pBtnT}>Annuale - 14,99 € / anno</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.pBtn} onPress={() => { setIsPremium(true); setShowPaywall(false); }}>
        <Text style={styles.pBtnT}>Sblocco a Vita - 24,99 €</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setShowPaywall(false)}>
        <Text style={styles.closeTxt}>Continua Limitato</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  paywall: { flex: 1, backgroundColor: '#1A1A2E', padding: 25, justifyContent: 'center' },
  paywallTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 10 },
  paywallSub: { fontSize: 14, color: '#E0E0E0', textAlign: 'center', marginBottom: 20 },
  feat: { fontSize: 14, color: '#FFF', marginBottom: 10 },
  pBtn: { backgroundColor: '#FFD700', padding: 12, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  pBtnT: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  adBtn: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, marginBottom: 15, alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  adBtnT: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  closeTxt: { color: '#AAA', textDecorationLine: 'underline', textAlign: 'center', marginTop: 10 }
});
