apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

project.ext.react = [
    enableHermes: true,  // Set this to true to enable Hermes
]

react {
    // Custom font support
    project.ext.vectoricons = [
        iconFontNames: ["MaterialCommunityIcons.ttf", "MaterialIcons.ttf", "Ionicons.ttf"]
    ]
    apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
    autolinkLibrariesWithApp()
}

// Disable Proguard for release unless explicitly needed
def enableProguardInReleaseBuilds = true

// Use default JavaScriptCore engine for Hermes fallback
def jscFlavor = 'org.webkit:android-jsc:+'

android {
    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
        // Fix for AppCompat version conflicts
        pickFirst '**/META-INF/androidx.appcompat_appcompat.version'
        pickFirst '**/META-INF/androidx.core_core.version'
        pickFirst '**/META-INF/androidx.lifecycle_lifecycle-runtime.version'
    }

    // Add resolution strategy to force AndroidX
    configurations.all {
        resolutionStrategy {
            force 'androidx.core:core:1.13.1'
            force 'androidx.appcompat:appcompat:1.6.1'
            force 'androidx.activity:activity:1.8.0'
        }
        // Force exclude old support libraries globally
        exclude group: 'com.android.support', module: 'appcompat-v7'
        exclude group: 'com.android.support', module: 'support-v4'
        exclude group: 'com.android.support', module: 'support-compat'
        exclude group: 'com.android.support', module: 'support-core-utils'
        exclude group: 'com.android.support', module: 'support-core-ui'
        exclude group: 'com.android.support', module: 'animated-vector-drawable'
        exclude group: 'com.android.support', module: 'support-vector-drawable'
    }

    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion

    namespace "com.edulearn"

    defaultConfig {
        applicationId "com.edulearn"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }

    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
            // No minify or Proguard for debug
            debuggable true
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation("com.facebook.react:react-android") {
        exclude group: 'com.android.support'
    }

    // Force AndroidX AppCompat
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")

    if (project.ext.react.enableHermes) {
        implementation("com.facebook.react:hermes-android") {
            exclude group: 'com.android.support'
        }
    } else {
        implementation jscFlavor
    }
}






This below is debug gradle 

apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

project.ext.react = [
    enableHermes: true,  // Set this to true to enable Hermes
]

react {
    // Custom font support
    project.ext.vectoricons = [
        iconFontNames: ["MaterialCommunityIcons.ttf", "MaterialIcons.ttf", "Ionicons.ttf"]
    ]
    apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
    autolinkLibrariesWithApp()
}

// Enable Proguard for release builds
def enableProguardInReleaseBuilds = true

// Use default JavaScriptCore engine for Hermes fallback
def jscFlavor = 'org.webkit:android-jsc:+'

android {
    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
        // Fix for AppCompat version conflicts
        pickFirst '**/META-INF/androidx.appcompat_appcompat.version'
        pickFirst '**/META-INF/androidx.core_core.version'
        pickFirst '**/META-INF/androidx.lifecycle_lifecycle-runtime.version'
    }

    // Add resolution strategy to force AndroidX
    configurations.all {
        resolutionStrategy {
            force 'androidx.core:core:1.13.1'
            force 'androidx.appcompat:appcompat:1.6.1'
            force 'androidx.activity:activity:1.8.0'
        }
        // Force exclude old support libraries globally
        exclude group: 'com.android.support', module: 'appcompat-v7'
        exclude group: 'com.android.support', module: 'support-v4'
        exclude group: 'com.android.support', module: 'support-compat'
        exclude group: 'com.android.support', module: 'support-core-utils'
        exclude group: 'com.android.support', module: 'support-core-ui'
        exclude group: 'com.android.support', module: 'animated-vector-drawable'
        exclude group: 'com.android.support', module: 'support-vector-drawable'
    }

    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion

    namespace "com.edulearn"

    defaultConfig {
        applicationId "com.edulearn"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"

    // Enable multidex for large apps
        multiDexEnabled true
    }

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE') && file(MYAPP_UPLOAD_STORE_FILE).exists()) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            } else {
                // Use debug keystore for release if no release keystore is configured
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
            debuggable true
            minifyEnabled false
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            debuggable false
            jniDebuggable false
            renderscriptDebuggable false
            zipAlignEnabled true
        }
    }

    // Enable APK splitting for different architectures
    splits {
        abi {
            enable true
            reset()
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
            universalApk true
        }
    }
}

dependencies {
    implementation("com.facebook.react:react-android") {
        exclude group: 'com.android.support'
    }

    // Force AndroidX AppCompat
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")

    // Add multidex support
    implementation 'androidx.multidex:multidex:2.0.1'

    if (project.ext.react.enableHermes) {
        implementation("com.facebook.react:hermes-android") {
            exclude group: 'com.android.support'
        }
    } else {
        implementation jscFlavor
    }
}
