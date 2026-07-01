import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '..');
export const SRC_DIR = path.join(ROOT_DIR, 'src');
export const BUILD_DIR = path.join(ROOT_DIR, 'assets', 'build');
export const BUILD_CSS_DIR = path.join(BUILD_DIR, 'css');
export const BUILD_JS_DIR = path.join(BUILD_DIR, 'js');
export const BUILD_IMG_DIR = path.join(BUILD_DIR, 'img');
export const BUILD_FONT_DIR = path.join(BUILD_DIR, 'fonts');
export const IMAGE_MANIFEST_PATH = path.join(BUILD_DIR, 'image-manifest.json');
export const SITE_ORIGIN = 'https://www.barishizm.eu';

export const ASSET_ALIASES = new Map([
  ['assets/img/masonry-portfolio/VoiceAssistant.jpg', 'assets/img/apple-intelligence-black.jpeg'],
  ['assets/img/services.jpg', 'assets/img/masonry-portfolio/WebSitePic.jpg']
]);

export const ICON_SOURCES = {
  favicon: 'assets/img/blue-thunder.ico',
  appleTouch: 'assets/img/bluethunder/blue-thunder-1.png'
};

export const CSS_BUNDLES = [
  {
    name: 'index.css',
    source: path.join(ROOT_DIR, 'src', 'scss', 'index.scss'),
    vendorCss: [
      'assets/vendor/bootstrap/css/bootstrap.min.css',
      'assets/vendor/bootstrap-icons/bootstrap-icons.css',
      'assets/vendor/aos/aos.css',
      'assets/vendor/glightbox/css/glightbox.min.css'
    ]
  },
  {
    name: 'content.css',
    source: path.join(ROOT_DIR, 'src', 'scss', 'content.scss'),
    vendorCss: [
      'assets/vendor/bootstrap/css/bootstrap.min.css',
      'assets/vendor/bootstrap-icons/bootstrap-icons.css',
      'assets/vendor/aos/aos.css'
    ]
  },
  {
    name: 'portfolio-details.css',
    source: path.join(ROOT_DIR, 'src', 'scss', 'portfolio-details.scss'),
    vendorCss: [
      'assets/vendor/bootstrap/css/bootstrap.min.css',
      'assets/vendor/bootstrap-icons/bootstrap-icons.css',
      'assets/vendor/aos/aos.css',
      'assets/vendor/swiper/swiper-bundle.min.css'
    ]
  },
  {
    name: 'digital-clock.css',
    source: path.join(ROOT_DIR, 'assets', 'css', 'DigitalClock.css'),
    rawCss: true,
    vendorCss: []
  }
];

export const JS_BUNDLES = [
  {
    name: 'content.js',
    source: path.join(ROOT_DIR, 'src', 'js', 'content.js')
  },
  {
    name: 'index.js',
    source: path.join(ROOT_DIR, 'src', 'js', 'index.js')
  },
  {
    name: 'portfolio-details.js',
    source: path.join(ROOT_DIR, 'src', 'js', 'portfolio-details.js')
  },
  {
    name: 'digital-clock.js',
    source: path.join(ROOT_DIR, 'src', 'js', 'digital-clock.js')
  }
];

export const PAGES = [
  {
    key: 'index',
    source: 'index.html',
    output: 'index.html',
    cssBundle: 'index.css',
    jsBundle: 'index.js',
    vendorScripts: [
      'assets/vendor/aos/aos.js',
      'assets/vendor/typed.js/typed.umd.js',
      'assets/vendor/purecounter/purecounter_vanilla.js',
      'assets/vendor/glightbox/js/glightbox.min.js',
      'assets/vendor/imagesloaded/imagesloaded.pkgd.min.js',
      'assets/vendor/isotope-layout/isotope.pkgd.min.js',
      'assets/vendor/php-email-form/validate.js'
    ],
    preloadIconsFont: true,
    prefetch: ['portfolio-details.html', 'DigitalClock.html']
  },
  {
    key: 'portfolio-details',
    source: 'portfolio-details.html',
    output: 'portfolio-details.html',
    cssBundle: 'portfolio-details.css',
    jsBundle: 'portfolio-details.js',
    vendorScripts: [
      'assets/vendor/aos/aos.js',
      'assets/vendor/swiper/swiper-bundle.min.js'
    ],
    preloadIconsFont: true,
    prefetch: []
  },
  {
    key: 'privacy-policy',
    source: 'privacy_policy.html',
    output: 'privacy_policy.html',
    cssBundle: 'content.css',
    jsBundle: 'content.js',
    vendorScripts: ['assets/vendor/aos/aos.js'],
    preloadIconsFont: true,
    prefetch: []
  },
  {
    key: 'service-details',
    source: 'service-details.html',
    output: 'service-details.html',
    cssBundle: 'content.css',
    jsBundle: 'content.js',
    vendorScripts: ['assets/vendor/aos/aos.js'],
    preloadIconsFont: true,
    prefetch: []
  },
  {
    key: 'starter-page',
    source: 'starter-page.html',
    output: 'starter-page.html',
    cssBundle: 'content.css',
    jsBundle: 'content.js',
    vendorScripts: ['assets/vendor/aos/aos.js'],
    preloadIconsFont: true,
    prefetch: []
  },
  {
    key: 'digital-clock',
    source: 'DigitalClock.html',
    output: 'DigitalClock.html',
    cssBundle: 'digital-clock.css',
    jsBundle: 'digital-clock.js',
    vendorScripts: [],
    preloadIconsFont: false,
    prefetch: []
  }
];

export const PAGE_IMAGE_HINTS = {
  'index.html': {
    'assets/img/Vector.jpg': {
      sizes: '100vw',
      loading: 'eager',
      fetchpriority: 'high',
      preload: true,
      widths: [768, 1200, 1600, 1920]
    },
    'assets/img/PP.jpg': {
      sizes: '(min-width: 992px) 33vw, 100vw',
      widths: [320, 480, 768, 904]
    },
    'assets/img/masonry-portfolio/ToDoApp.jpg': {
      sizes: '(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw'
    },
    'assets/img/apple-intelligence-black.jpeg': {
      sizes: '(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw'
    },
    'assets/img/masonry-portfolio/WebSitePic.jpg': {
      sizes: '(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw'
    },
    'assets/img/masonry-portfolio/masonry-portfolio-4.jpg': {
      sizes: '(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw'
    },
    'assets/img/masonry-portfolio/IBM.jpg': {
      sizes: '(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw'
    },
    'assets/img/masonry-portfolio/TaX.jpg': {
      sizes: '(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw'
    },
    'assets/img/clockk.png': {
      sizes: '(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw'
    }
  },
  'portfolio-details.html': {
    'assets/img/portfolio/app-1.jpg': {
      sizes: '(min-width: 1200px) 66vw, 100vw',
      loading: 'eager',
      fetchpriority: 'high',
      preload: true
    },
    'assets/img/portfolio/product-1.jpg': {
      sizes: '(min-width: 1200px) 66vw, 100vw'
    },
    'assets/img/portfolio/branding-1.jpg': {
      sizes: '(min-width: 1200px) 66vw, 100vw'
    },
    'assets/img/portfolio/books-1.jpg': {
      sizes: '(min-width: 1200px) 66vw, 100vw'
    },
    'assets/img/PP.jpg': {
      sizes: '90px',
      widths: [90, 180, 320, 480, 768, 904]
    }
  },
  'privacy_policy.html': {
    'assets/img/Privacy.jpg': {
      sizes: '(min-width: 992px) 66vw, 100vw',
      loading: 'eager'
    }
  },
  'service-details.html': {
    'assets/img/services.jpg': {
      sizes: '(min-width: 992px) 66vw, 100vw',
      loading: 'eager'
    }
  }
};

export const CRITICAL_CSS = {
  index: 'body{margin:0;background:#060606;color:#fff;font-family:Roboto,system-ui,sans-serif}picture,img{display:block;max-width:100%;height:auto}.header{position:fixed;top:0;left:0;bottom:0;z-index:997}.hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:80px 0}.hero picture,.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.hero:before{content:"";position:absolute;inset:0;background:rgba(6,6,6,.3);z-index:1}.hero .container{position:relative;z-index:2}',
  content: 'body{margin:0;background:#060606;color:#fff;font-family:Roboto,system-ui,sans-serif}picture,img{display:block;max-width:100%;height:auto}.header{position:fixed;top:0;left:0;bottom:0;z-index:997}.page-title{padding:80px 0 40px}.service-details .services-img{margin-bottom:20px}',
  portfolioDetails: 'body{margin:0;background:#060606;color:#fff;font-family:Roboto,system-ui,sans-serif}picture,img{display:block;max-width:100%;height:auto}.header{position:fixed;top:0;left:0;bottom:0;z-index:997}.page-title{padding:80px 0 40px}.portfolio-details .portfolio-details-slider img{width:100%}',
  digitalClock: '*{box-sizing:border-box}html,body{height:100%;margin:0}body{background:#000;display:flex;justify-content:center;align-items:center;color:#fff}img{display:block;max-width:100%;height:auto}.clock{height:20vh;font-size:22vh;line-height:20.4vh;display:flex;position:relative;overflow:hidden}'
};
