# VitalSource Downloader

This script lets you download an ebook from VitalSource in JPG format to then merge into PDF

## Usage

Go to [`index.js`](index.js). Change `globalCookieVal` to the cookie header sent from jigsaw.vitalsource.com in the browser after authentication. Then change `bookID` to the numerical ISBN of the ebook you're downloading.

```bash
npm start
```

Alternatively, you can also run `node index`

## License

[MIT](LICENSE) Clouderrific.

## Credit

Based on the script by [Cyberscape](https://github.com/cscape/vitalsource-dl)
