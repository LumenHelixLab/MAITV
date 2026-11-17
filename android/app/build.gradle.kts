plugins {
    id("com.android.application")
}
android {
    namespace = "tech.lumenhelix.maitv"
    compileSdk = 35

    defaultConfig {
        applicationId = "tech.lumenhelix.maitv"
        minSdk = 26
        targetSdk = 35
        versionCode = 1000051
        versionName = "1.0.0-rc.2"
    }
    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")
}
