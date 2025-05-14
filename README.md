# GarageBouldering

Garage bouldering is a ReactNative app for creating, viewing and logging boulder problems on a custom bouldering wall.

## Specification

### The app

The app contains multiple pages
1. Home page - with a list of available boulder problems, by clicking on a problem, the user is taken to details page
2. Details page - contains an image of the bouldering wall with highlighted holds belonging to the problem, 
the average perceived difficulty and a button for logging a send (send means completing the problem)
3. Log send page - lets the user log the number of attempts and perceived difficulty of the problem to a database
4. Send list - contains a list of every user's sends
5. Create boulder - lets user interactively by tapping at holds build and save a new boulder problem
6. Ranking - shows users ranking by awarding points based on difficulty of sent boulders
7. Setting page - lets user filter boulder problems by different attributes

The app is written using Expo framework - ReactNative and TypeScript. It is mainly aimed to be built for android.

### The backend

A web backend is needed for the app to function, it's specification can be found [here](https://github.com/pepanzdorf/GarageClimbingAPI)

## Installation

First the backend API needs to be setup by following the [readme](https://github.com/pepanzdorf/GarageClimbingAPI).

Then change the `apiURL` variable to the correct URL in [Other.ts](./constants/Other.ts)

### Build APK using Expo

```bash
npx eas-cli@latest build --platform android --profile production --local
```

Then install the apk on your device.

### Build a Signed APK from React Native (Ejected Expo)

If you want to build the app without using expo

```bash
npx expo eject
```

Select bare when prompted. This will create `android` directory.

Install dependencies:
```bash
npm install
# or
yarn install
```

Generate keystore
```bash
keytool -genkeypair -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

Inside `android/app/build.gradle`
Add inside `android {}`
```gradle
signingConfigs {
    release {
        storeFile file("my-release-key.keystore")
        storePassword "your-store-password"
        keyAlias "my-key-alias"
        keyPassword "your-key-password"
    }
}
```

```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
    }
}
```

Build the apk. Run inside `android/`

```bash
./gradlew assembleRelease
```

The apk should be found at `android/app/build/outputs/apk/release/app-release.apk`

Lastly install the apk on your device.

# Images

![detail page](./readme_images/detail.png)
![log page](./readme_images/log_screen.png)
![new boulder problem](./readme_images/new_boulder.png)
