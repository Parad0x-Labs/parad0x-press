# Application ProGuard Rules
# Keep React Native Native Modules (IMPORTANT)
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep our custom modules
-keep class com.seekercompress.** { *; }

# FFmpegKit
-keep class com.arthenica.ffmpegkit.** { *; }

# OkHttp/Retrofic (if used by Solana)
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
