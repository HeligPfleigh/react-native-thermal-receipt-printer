# Example React Native Application for @intechnity/react-native-thermal-printer

This is an example application showing how to use the `@intechnity/react-native-thermal-printer` package in a React Native project.

## Project Structure

The main project repository includes the `@intechnity/react-native-thermal-printer` package and this example app, which is located under the './example' subdirectory.

## Setup

Before running the example application, you need to make sure that the `@intechnity/react-native-thermal-printer` package is correctly built and installed.

### Updating and Building the @intechnity/react-native-thermal-printer package

If you have made changes to the `@intechnity/react-native-thermal-printer` package and want these changes to reflect in this example app, you need to build the package.

Execute the following command in the root directory of the `@intechnity/react-native-thermal-printer` package:

```bash
npm run build
```

### Installing the Updated Package in the Example App

Once the package has been built, navigate to the './example' directory and execute the following command:

```bash
npm i ../ --install-links
```

This will ensure that the example app is using the latest built version of the @intechnity/react-native-thermal-printer package.

## Running the Example App

Once you've installed all the dependencies, you can run the example app.

```bash
npx react-native run-android
```
