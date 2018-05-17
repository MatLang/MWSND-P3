// Plugins

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var del = require('del');
var assign = require('lodash/object/assign');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var hbsfy = require('hbsfy');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var mergeStream = require('merge-stream');
var through = require('through2');
/* var browserSync = require('browser-sync').create(); */
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var critical = require('critical').stream;
var htmlmin = require('gulp-htmlmin');
var gzip = require('gulp-gzip');
var cssnano = require('gulp-cssnano');
/* var inlineCss = require('gulp-inline-css'); */
var inlinesource = require('gulp-inline-source');

// Image compression & conversion

var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var webp = require('gulp-webp');

// Paths

var BUILD_PATH = 'build/public';
var CSS_PATH = 'css/**/*.scss';
var JS_PATH = 'js/**/*.js';
var IMAGES_PATH = 'img/**/*.{png,jpeg,jpg,svg,gif}';
var SW_PATH = 'sw.js';
var HTML_PATH = '*.html';

/* BUNDLE */

function createBundle(src) {
    if (!src.push) {
        src = [src];
    }

    var customOpts = {
        entries: src,
        debug: true
    };
    var opts = assign({}, watchify.args, customOpts);
    var b = watchify(browserify(opts));

    b.transform(babelify.configure({
        stage: 1
    }));

    b.transform(hbsfy);
    b.on('log', plugins.util.log);
    return b;
}

function bundle(b, outputPath) {
    var splitPath = outputPath.split('/');
    var outputFile = splitPath[splitPath.length - 1];
    var outputDir = splitPath.slice(0, -1).join('/');

    return b.bundle()
        // log errors if they happen
        .on('error', plugins.util.log.bind(plugins.util, 'Browserify Error'))
        .pipe(source(outputFile))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(plugins.sourcemaps.init({ loadMaps: true })) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .pipe(plugins.sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('build/public/' + outputDir));
}

var jsBundles = {
    'js/dbhelper.js': createBundle('./js/dbhelper.js'),
    'js/main.js': createBundle('./js/main.js'),
    'js/restaurant_info.js': createBundle('./js/restaurant_info.js'),
    'sw.js': createBundle('sw.js')
};

gulp.task('js:browser', function () {
    return mergeStream.apply(null,
        Object.keys(jsBundles).map(function (key) {
            return bundle(jsBundles[key], key);
        })
    );
});

// STYLES

gulp.task('styles', function () {
    return gulp.src(CSS_PATH)
        .pipe(plumber(function (err) {
            console.log('Styles Task Error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(minifyCss())
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        /*         .pipe(gzip()) */
        .pipe(gulp.dest(BUILD_PATH + '/css'))
        .pipe(livereload());
})

// Templates

gulp.task('build', function () {
    return gulp.src(HTML_PATH)
        .pipe(gulp.dest('./build/public'))
})

gulp.task('inline-minify', ['build'], function () {
    return gulp.src('build/public/*.html')
        .pipe(inlinesource())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./build/public'))
        .pipe(gzip())
        .pipe(gulp.dest('./build/public'));
})

gulp.task('templates', ['build', 'inline-minify']);

// Images

gulp.task('images', function () {
    return gulp.src(IMAGES_PATH)
        .pipe(imagemin(
            [
                imagemin.gifsicle(),
                imagemin.jpegtran(),
                imagemin.optipng(),
                imagemin.svgo(),
                imageminPngquant(),
                imageminJpegRecompress()
            ]
        ))
        .pipe(gulp.dest(BUILD_PATH + '/images'))
        .pipe(webp())
        .pipe(gulp.dest(BUILD_PATH + '/images'))
})

/* WATCH TASK + BROWSER SYNC */

gulp.task('watch', function () {

    require('./server.js');
    livereload.listen();
    gulp.watch(IMAGES_PATH, ['images']);
    gulp.watch(JS_PATH, ['js:browser']);
    gulp.watch(SW_PATH, ['js:browser']);
    gulp.watch(CSS_PATH, ['styles']);
    gulp.watch(HTML_PATH, ['templates']);
});
