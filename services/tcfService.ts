import { Directory, File, Paths } from 'expo-file-system';
import { TCFFile, TCFMetadata, TCFTemplate, PersonalTCFTemplate } from '../types/telos';

const TCF_DIR = new Directory(Paths.document, 'telos');

/**
 * Ensure the Telos directory exists
 */
async function ensureDirectoryExists(): Promise<void> {
  if (!TCF_DIR.exists) {
    await TCF_DIR.create();
  }
}

/**
 * Load metadata for all TCF files
 */
async function loadMetadata(): Promise<TCFMetadata[]> {
  try {
    await ensureDirectoryExists();
    const metadataFile = new File(TCF_DIR, 'metadata.json');

    if (metadataFile.exists) {
      const content = await metadataFile.text();
      return JSON.parse(content);
    }

    return [];
  } catch (error) {
    console.error('Error loading metadata:', error);
    return [];
  }
}

/**
 * Save metadata for all TCF files
 */
async function saveMetadata(metadata: TCFMetadata[]): Promise<void> {
  try {
    await ensureDirectoryExists();
    const metadataFile = new File(TCF_DIR, 'metadata.json');
    await metadataFile.write(JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Error saving metadata:', error);
    throw new Error('Failed to save metadata');
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `tcf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get File instance for a TCF file
 */
function getTCFFile(id: string): File {
  return new File(TCF_DIR, `${id}.md`);
}

/**
 * Load all TCF files
 */
export async function loadTCFFiles(): Promise<TCFFile[]> {
  try {
    const metadata = await loadMetadata();
    const files: TCFFile[] = [];

    for (const meta of metadata) {
      try {
        const file = getTCFFile(meta.id);

        if (file.exists) {
          const content = await file.text();
          files.push({
            id: meta.id,
            name: meta.name,
            path: file.uri,
            content,
            createdAt: new Date(meta.createdAt),
            updatedAt: new Date(meta.updatedAt),
          });
        }
      } catch (error) {
        console.error(`Error loading file ${meta.id}:`, error);
      }
    }

    return files.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error loading TCF files:', error);
    return [];
  }
}

/**
 * Create a new TCF file from a template
 */
export async function createTCF(name: string, template: TCFTemplate = PersonalTCFTemplate): Promise<TCFFile> {
  try {
    await ensureDirectoryExists();

    const id = generateId();
    const now = new Date();

    // Write the content to file
    const file = getTCFFile(id);
    await file.write(template.initialContent);

    // Update metadata
    const metadata = await loadMetadata();
    metadata.push({
      id,
      name,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await saveMetadata(metadata);

    return {
      id,
      name,
      path: file.uri,
      content: template.initialContent,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error creating TCF:', error);
    throw new Error('Failed to create Telos file');
  }
}

/**
 * Update a TCF file with new content
 * Uses atomic write (write to temp file, then rename)
 */
export async function updateTCF(id: string, content: string): Promise<void> {
  try {
    const file = getTCFFile(id);
    const tempFile = new File(TCF_DIR, `${id}.md.tmp`);
    const backupFile = new File(TCF_DIR, `${id}.md.backup`);

    // Create backup of existing file
    if (file.exists) {
      await file.copy(backupFile);
    }

    // Write to temp file first
    await tempFile.write(content);

    // Atomic rename
    if (file.exists) {
      await file.delete();
    }
    await tempFile.move(file);

    // Delete backup if write was successful
    if (backupFile.exists) {
      await backupFile.delete();
    }

    // Update metadata
    const metadata = await loadMetadata();
    const fileMetadata = metadata.find(m => m.id === id);
    if (fileMetadata) {
      fileMetadata.updatedAt = new Date().toISOString();
      await saveMetadata(metadata);
    }
  } catch (error) {
    console.error('Error updating TCF:', error);

    // Try to restore from backup
    const file = getTCFFile(id);
    const backupFile = new File(TCF_DIR, `${id}.md.backup`);

    if (backupFile.exists) {
      await backupFile.copy(file);
    }

    throw new Error('Failed to update Telos file');
  }
}

/**
 * Delete a TCF file
 */
export async function deleteTCF(id: string): Promise<void> {
  try {
    const file = getTCFFile(id);
    if (file.exists) {
      await file.delete();
    }

    // Update metadata
    const metadata = await loadMetadata();
    const filteredMetadata = metadata.filter(m => m.id !== id);
    await saveMetadata(filteredMetadata);
  } catch (error) {
    console.error('Error deleting TCF:', error);
    throw new Error('Failed to delete Telos file');
  }
}

/**
 * Export a TCF file (returns the content for sharing)
 */
export async function exportTCF(id: string): Promise<string> {
  try {
    const file = getTCFFile(id);
    return await file.text();
  } catch (error) {
    console.error('Error exporting TCF:', error);
    throw new Error('Failed to export Telos file');
  }
}

/**
 * Import a TCF file from markdown content
 */
export async function importTCF(name: string, content: string): Promise<TCFFile> {
  try {
    await ensureDirectoryExists();

    const id = generateId();
    const now = new Date();

    // Write the content to file
    const file = getTCFFile(id);
    await file.write(content);

    // Update metadata
    const metadata = await loadMetadata();
    metadata.push({
      id,
      name,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    await saveMetadata(metadata);

    return {
      id,
      name,
      path: file.uri,
      content,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error importing TCF:', error);
    throw new Error('Failed to import Telos file');
  }
}

/**
 * Rename a TCF file
 */
export async function renameTCF(id: string, newName: string): Promise<void> {
  try {
    const metadata = await loadMetadata();
    const fileMetadata = metadata.find(m => m.id === id);

    if (fileMetadata) {
      fileMetadata.name = newName;
      fileMetadata.updatedAt = new Date().toISOString();
      await saveMetadata(metadata);
    } else {
      throw new Error('File not found');
    }
  } catch (error) {
    console.error('Error renaming TCF:', error);
    throw new Error('Failed to rename Telos file');
  }
}
