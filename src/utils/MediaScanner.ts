import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

export interface MediaStats {
    photoCount: number;
    videoCount: number;
    audioCount: number;
    totalSizeBytes: number;
    estimatedSavingsBytes: number;
}

export interface CompressionResult {
    originalSize: number;
    compressedSize: number;
    savedBytes: number;
    savedPercent: number;
}

const PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg'];

export const MediaScanner = {

    async requestPermissions(): Promise<boolean> {
        if (Platform.OS !== 'android') return true;
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    },

    async scanMedia(): Promise<MediaStats> {
        const dcimPath = RNFS.ExternalStorageDirectoryPath + '/DCIM';
        const picturesPath = RNFS.ExternalStorageDirectoryPath + '/Pictures';
        const moviesPath = RNFS.ExternalStorageDirectoryPath + '/Movies';
        const musicPath = RNFS.ExternalStorageDirectoryPath + '/Music';

        let stats: MediaStats = {
            photoCount: 0,
            videoCount: 0,
            audioCount: 0,
            totalSizeBytes: 0,
            estimatedSavingsBytes: 0,
        };

        const scanDir = async (path: string) => {
            try {
                const files = await RNFS.readDir(path);
                for (const file of files) {
                    if (file.isDirectory()) {
                        await scanDir(file.path);
                    } else {
                        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                        const size = parseInt(file.size) || 0;

                        if (PHOTO_EXTENSIONS.includes(ext)) {
                            stats.photoCount++;
                            stats.totalSizeBytes += size;
                            stats.estimatedSavingsBytes += size * 0.85; // ~85% savings estimate
                        } else if (VIDEO_EXTENSIONS.includes(ext)) {
                            stats.videoCount++;
                            stats.totalSizeBytes += size;
                            stats.estimatedSavingsBytes += size * 0.70; // ~70% savings estimate
                        } else if (AUDIO_EXTENSIONS.includes(ext)) {
                            stats.audioCount++;
                            stats.totalSizeBytes += size;
                            stats.estimatedSavingsBytes += size * 0.50; // ~50% savings estimate
                        }
                    }
                }
            } catch (e) {
                // Directory doesn't exist or no permission
            }
        };

        await Promise.all([
            scanDir(dcimPath),
            scanDir(picturesPath),
            scanDir(moviesPath),
            scanDir(musicPath),
        ]);

        return stats;
    },

    formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
