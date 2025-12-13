import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { DraculaColors } from '../constants/theme';
import { useTelosStore } from '../stores/useTelosStore';
import TCFPreview from '../components/tcf/TCFPreview';
import { exportTCF } from '../services/tcfService';

export default function Preview() {
  const router = useRouter();
  const { activeFile } = useTelosStore();

  if (!activeFile) {
    router.back();
    return null;
  }

  const handleExport = async () => {
    try {
      const content = await exportTCF(activeFile.id);

      // Create a temporary file to share
      const fileName = `${activeFile.name}.md`;
      const tempFile = new File(Paths.cache, fileName);
      await tempFile.write(content);

      // Share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(tempFile.uri, {
          mimeType: 'text/markdown',
          dialogTitle: 'Export Telos File',
          UTI: 'public.text',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Could not export the file');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color={DraculaColors.foreground} />
        <Appbar.Content title="Preview" titleStyle={{ color: DraculaColors.foreground }} />
        <Appbar.Action
          icon="export"
          color={DraculaColors.foreground}
          onPress={handleExport}
        />
      </Appbar.Header>

      <TCFPreview file={activeFile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DraculaColors.background,
  },
  header: {
    backgroundColor: DraculaColors.current,
  },
});
