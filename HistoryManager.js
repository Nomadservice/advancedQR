import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function HistoryManager({ history, saveHistory }) {
  const [archiveTab, setArchiveTab] = useState('scanned'); 

  const clearHistory = (typeToRemove) => {
    Alert.alert(
      "Svuota Archivio",
      `Vuoi davvero eliminare tutti i codici ${typeToRemove === 'Scansionato' ? 'scansionati' : 'generati'}?`,
      [
        { text: "Annulla", style: "cancel" },
        { text: "Elimina", style: "destructive", onPress: () => {
          let filtered;
          if (typeToRemove === 'Scansionato') {
            filtered = history.filter(h => h.type !== 'Scansionato');
          } else {
            filtered = history.filter(h => h.type !== 'Statico' && h.type !== 'Dinamico');
          }
          saveHistory(filtered);
        }}
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.subSubNav}>
        <TouchableOpacity style={[styles.subTab, archiveTab === 'scanned' && styles.subTabAct]} onPress={() => setArchiveTab('scanned')}>
          <Text style={styles.tabTxt}>Scansionati</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.subTab, archiveTab === 'generated' && styles.subTabAct]} onPress={() => setArchiveTab('generated')}>
          <Text style={styles.tabTxt}>Generati</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.pad}>
        {archiveTab === 'scanned' && (
          <>
            {history.filter(h => h.type === 'Scansionato').map(h => (
              <View key={h.id} style={styles.card}>
                <Text style={styles.cardHead}>Scansionato - {h.date}</Text>
                <Text style={styles.cardData} numberOfLines={1}>{h.data}</Text>
              </View>
            ))}
            {history.filter(h => h.type === 'Scansionato').length === 0 && <Text style={styles.emptyTxt}>Nessun codice scansionato.</Text>}
            {history.filter(h => h.type === 'Scansionato').length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => clearHistory('Scansionato')}>
                <Text style={styles.clearBtnT}>Svuota Scansionati</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {archiveTab === 'generated' && (
          <>
            {history.filter(h => h.type === 'Statico' || h.type === 'Dinamico').map(h => (
              <View key={h.id} style={styles.card}>
                <Text style={styles.cardHead}>{h.type} - {h.date}</Text>
                <Text style={styles.cardData} numberOfLines={1}>{h.data}</Text>
              </View>
            ))}
            {history.filter(h => h.type === 'Statico' || h.type === 'Dinamico').length === 0 && <Text style={styles.emptyTxt}>Nessun codice generato.</Text>}
            {history.filter(h => h.type === 'Statico' || h.type === 'Dinamico').length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => clearHistory('Generato')}>
                <Text style={styles.clearBtnT}>Svuota Generati</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  subSubNav: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 15 },
  subTab: { flex: 1, padding: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#141929' },
  subTabAct: { borderBottomColor: '#00ADB5' },
  tabTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  pad: { flex: 1, paddingHorizontal: 20 },
  card: { backgroundColor: '#141929', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1F273D' }, 
  cardHead: { color: '#00ADB5', fontSize: 12, fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  cardData: { color: '#FFF', fontSize: 14 },
  emptyTxt: { color: '#4E5D78', textAlign: 'center', marginTop: 30, fontSize: 14, fontWeight: '600' },
  clearBtn: { backgroundColor: '#291419', padding: 14, borderRadius: 16, alignItems: 'center', marginTop: 10, marginBottom: 30, borderWidth: 1, borderColor: '#4A1D24' },
  clearBtnT: { color: '#FF5C5C', fontWeight: '700' }
});
