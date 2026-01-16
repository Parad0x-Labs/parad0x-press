package com.seekercompress

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.media.MediaMetadataRetriever

class DreamscapeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DreamscapeEngine" // The "Safety & Utility" Engine
    }

    @ReactMethod
    fun isSeeker(promise: Promise) {
        val model = android.os.Build.MODEL
        val manufacturer = android.os.Build.MANUFACTURER
        // Check for Seeker or Saga (previous gen, usually treated same for exclusives)
        val isSolanaPhone = model.contains("Seeker", ignoreCase = true) || 
                           model.contains("Saga", ignoreCase = true)
        promise.resolve(isSolanaPhone)
    }

    @ReactMethod
    fun checkBatteryLevel(promise: Promise) {
        try {
            val ifilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
            val batteryStatus = reactApplicationContext.registerReceiver(null, ifilter)
            val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
            val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
            val pct = level / scale.toFloat()
            promise.resolve(pct)
        } catch (e: Exception) {
            promise.reject("ERR_BATTERY", e.message)
        }
    }

    @ReactMethod
    fun atomicSwap(originalPath: String, tempPath: String, promise: Promise) {
        // RULE 7: ATOMIC SAFETY (NO DATA LOSS)
        val tempFile = File(tempPath)
        val originalFile = File(originalPath)

        if (!tempFile.exists()) {
            promise.reject("ERR_SAFETY_1", "Compressed file does not exist! Aborting swap.")
            return
        }

        if (tempFile.length() < 1024) { // Suspiciously small (placeholder?)
            promise.reject("ERR_SAFETY_2", "Compressed file is invalid/empty (${tempFile.length()} bytes). Aborting swap.")
            return
        }

        // Verify it is actual media
        try {
           val retriever = MediaMetadataRetriever()
           retriever.setDataSource(tempPath)
           val hasVideo = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_HAS_VIDEO)
           val hasImage = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_HAS_IMAGE)
           // Note: hasImage is only for API 28+, simplistic check for now is enough: setDataSource succeeds
           retriever.release()
        } catch (e: Exception) {
             // If we can't read metadata, it might be corrupt.
             // For strict safety, we abort.
             promise.reject("ERR_SAFETY_3", "Compressed file metadata invalid. File may be corrupt. Aborting swap.")
             return
        }
        
        // If we are here, Temp is Valid.
        // We do NOT delete Original. We overwrite it if possible, or move.
        // For Android 10+ Scoped Storage, this might need MediaStore logic if not internal storage.
        // Assuming direct path access (legacy/manage_all_files permission) for this MVP on Seeker.
        
        try {
            // Backup logic: if overwrite fails, we still have temp.
            val backup = File(originalPath + ".bak")
            originalFile.renameTo(backup) // Rename original to .bak
            
            if (tempFile.renameTo(originalFile)) {
                // Success! Delete backup.
                backup.delete()
                promise.resolve(true)
            } else {
                // Failed to move temp to original. Restore backup.
                backup.renameTo(originalFile)
                promise.reject("ERR_SWAP", "Could not rename temp to original. Restored backup.")
            }
        } catch (e: Exception) {
            promise.reject("ERR_SWAP_EX", e.message)
        }
    }
}
