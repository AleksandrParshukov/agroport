const gulp = require('gulp'),
  sass = require('gulp-sass')(require('sass')),
  autoprefixer = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify'),
  gulpif = require('gulp-if'),
  cleancss = require('gulp-clean-css'),
  sourcemap = require('gulp-sourcemaps'),
  rename = require('gulp-rename'),
  del = require('del'),
  sync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include');

// Styles

const isDev = process.env.NODE_ENV === 'dev' ? true : false;

function scss(done) {
  gulp
    .src('source/scss/**/*.scss')
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(gulp.dest('docs/css'))
    .pipe(sync.stream());
  done();
}

exports.scss = scss;

/* const styles = () => {
	return gulp
		.src('source/less/style.less')
		.pipe(plumber())
		.pipe(sourcemap.init())
		.pipe(less())
		.pipe(gulp.dest('docs/css'))
		.pipe(postcss([autoprefixer(), csso()]))
		.pipe(rename('style.min.css'))
		.pipe(sourcemap.write('.'))
		.pipe(gulp.dest('docs/css'))
		.pipe(sync.stream());
};


exports.styles = styles;
*/

// JS

const js = () => {
  return gulp.src('source/js/*.js').pipe(gulp.dest('docs/js')).pipe(sync.stream());
};

exports.js = js;

// HTML

const html = () => {
  // return gulp.src('source/*.html').pipe(gulp.dest('docs'));

  return gulp
    .src('source/[^_]*.html')
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: '@file',
      })
    )
    .pipe(gulp.dest('docs'));
};

// Copy

const copy = (done) => {
  gulp
    .src(
      [
        'source/fonts/*.{ttf,woff2,woff,otf}',
        'source/*.ico',
        'source/img/**/*.{jpg,png,svg,gif,webp,mp4,webm}',
        'source/css/*.css',
        'source/js/**/*.js',
        'source/files/**/*',
        'source/**/*.php',
      ],
      {
        base: 'source',
      }
    )
    .pipe(gulp.dest('docs'));
  done();
};

exports.copy = copy;

// Clean

const clean = () => {
  return del('docs');
};

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'docs',
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

// Reload

const reload = (done) => {
  sync.reload();
  done();
};

// Watcher

const watcher = () => {
  gulp.watch('source/scss/**/*.scss', gulp.series(scss));
  gulp.watch('source/js/*.js', gulp.series(js, reload));
  gulp.watch('source/*.html', gulp.series(html, reload));
};

// build

const build = gulp.series(clean, gulp.parallel(scss, js, html, copy));

exports.build = build;

// Default

exports.default = gulp.series(build, gulp.series(server, watcher));
