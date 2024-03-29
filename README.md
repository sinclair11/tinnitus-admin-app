# TinnistusSounds CMS Application 2021 (TNS)

![Image](/assets/images/logo.png?raw=true "Logo")

## Core Features

- 🎥   Upload videos
- 🎶   Upload audios
- 🎛   Sounds generator
- 📊   Statistics
- ▶️   YouTube channel


## Installation

- Use install .exe for Windows
- Run .app bunddle for MacOS


## Start : Development

To develop and run your application, you need to run following command.
Start electron application for development :

```bash
npm start
```

## Lint : Development

To lint application source code using ESLint via this command :

```bash
npm lint
```

## Package : Production

Customize and package your Electron app with OS-specific bundles (.app, .exe etc)

```bash
npm package
```

## Make : Production

Making is a way of taking your packaged application and making platform specific distributables like DMG, EXE, or Flatpak files (amongst others).

```bash
npm make
```


## Publish : Production

Publishing is a way of taking the artifacts generated by the `make` command and sending them to a service somewhere for you to distribute or use as updates. (This could be your update server or an S3 bucket)

```bash
npm publish
```


## Packager & Makers Configuration

This provides an easy way of configuring your packaged application and making platform specific distributables like DMG, EXE, or Flatpak files.

This configurations file is available in :

```
tools/forge/forge.config.js
```
