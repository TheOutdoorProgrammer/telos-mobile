import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, FAB, Card, IconButton, ActivityIndicator, Appbar, Portal, Dialog, Button, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { DraculaColors } from '../constants/theme';
import { useTelosStore } from '../stores/useTelosStore';

export default function Index() {
  const router = useRouter();
  const { files, isLoadingFiles, loadFiles, selectFile, deleteFile, initialize, createNewChat, importFile } = useTelosStore();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importContent, setImportContent] = useState('');

  useEffect(() => {
    initialize();
    loadFiles();
  }, []);

  const handleFilePress = async (fileId: string) => {
    selectFile(fileId);
    await createNewChat();
    router.push('/chat');
  };

  const handlePreviewFile = (fileId: string) => {
    selectFile(fileId);
    router.push('/preview');
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    setFileToDelete({ id: fileId, name: fileName });
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (fileToDelete) {
      try {
        await deleteFile(fileToDelete.id);
        setDeleteDialogVisible(false);
        setFileToDelete(null);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const handleImportPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/markdown', 'text/plain', 'text/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const file = new File(asset.uri);
        const content = await file.text();

        // Extract name from file (remove .md extension)
        const nameWithoutExt = asset.name.replace(/\.md$/, '');

        setImportFileName(nameWithoutExt);
        setImportContent(content);
        setImportDialogVisible(true);
      }
    } catch (error) {
      console.error('Import pick error:', error);
      Alert.alert('Import Failed', 'Could not read the file');
    }
  };

  const handleImportConfirm = async () => {
    try {
      if (!importFileName.trim()) {
        Alert.alert('Error', 'Please enter a file name');
        return;
      }

      await importFile(importFileName, importContent);
      await loadFiles();

      setImportDialogVisible(false);
      setImportFileName('');
      setImportContent('');

      Alert.alert('Success', 'File imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'Could not import the file');
    }
  };

  if (isLoadingFiles && files.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={DraculaColors.purple} />
      </View>
    );
  }

  if (files.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          Welcome to Telos
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Your personal context framework
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Create your first Telos file to get started
        </Text>

        <FAB
          icon="plus"
          label="Create Telos File"
          style={styles.fab}
          onPress={() => router.push('/onboarding')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Telos Files" titleStyle={{ color: DraculaColors.foreground }} />
        <Appbar.Action
          icon="file-import"
          iconColor={DraculaColors.foreground}
          onPress={handleImportPick}
        />
        <Appbar.Action
          icon="cog"
          iconColor={DraculaColors.foreground}
          onPress={() => router.push('/settings')}
        />
      </Appbar.Header>
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingFiles}
            onRefresh={loadFiles}
            tintColor={DraculaColors.purple}
          />
        }
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => handleFilePress(item.id)}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    {item.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.cardSubtitle}>
                    Updated {item.updatedAt.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <IconButton
                    icon="eye"
                    iconColor={DraculaColors.cyan}
                    size={20}
                    onPress={() => handlePreviewFile(item.id)}
                  />
                  <IconButton
                    icon="delete"
                    iconColor={DraculaColors.red}
                    size={20}
                    onPress={() => handleDeleteFile(item.id, item.name)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <FAB
        icon="plus"
        label="New File"
        style={styles.fab}
        onPress={() => router.push('/onboarding')}
      />

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Delete File</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDeleteDialogVisible(false)}
              textColor={DraculaColors.comment}
            >
              Cancel
            </Button>
            <Button
              onPress={handleDeleteConfirm}
              textColor={DraculaColors.red}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={importDialogVisible}
          onDismiss={() => setImportDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Import File</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Enter a name for the imported file:
            </Text>
            <TextInput
              mode="outlined"
              label="File Name"
              value={importFileName}
              onChangeText={setImportFileName}
              style={styles.input}
              outlineColor={DraculaColors.current}
              activeOutlineColor={DraculaColors.purple}
              textColor={DraculaColors.foreground}
              theme={{
                colors: {
                  background: DraculaColors.background,
                },
              }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setImportDialogVisible(false)}
              textColor={DraculaColors.comment}
            >
              Cancel
            </Button>
            <Button
              onPress={handleImportConfirm}
              textColor={DraculaColors.purple}
            >
              Import
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DraculaColors.background,
  },
  appbar: {
    backgroundColor: DraculaColors.current,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DraculaColors.background,
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  title: {
    color: DraculaColors.foreground,
    marginBottom: 10,
  },
  subtitle: {
    color: DraculaColors.comment,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: DraculaColors.comment,
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    marginBottom: 12,
    backgroundColor: DraculaColors.current,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    color: DraculaColors.foreground,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: DraculaColors.comment,
  },
  cardActions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  dialog: {
    backgroundColor: DraculaColors.background,
  },
  dialogTitle: {
    color: DraculaColors.foreground,
  },
  dialogText: {
    color: DraculaColors.foreground,
  },
  input: {
    marginBottom: 8,
  },
});
