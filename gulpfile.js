var _ = require('lodash'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    buffer = require('vinyl-buffer'),
    browserSync = require('browser-sync').create(),
    babelify = require('babelify'),
    watchify = require('watchify'),
    server = require('./server.js');

// ----- Config

var paths = {
    jsIn: 'js/src/main.js',
    jsOut: 'js/dist',
    cssIn: 'scss/**/*.scss',
    cssOut: 'css',
    html: ['./index.html']
};

var site = {
    'index.html': '',
    'css/style.css': 'css',
    'js/dist/script.min.js': 'js/dist',
    'img/**/*': 'img'
};

function css() {

    var processors = [
        autoprefixer('last 2 versions')
    ];

    gulp.src( paths.cssIn )
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest( paths.cssOut ));

}

gulp.task('css', css);

var bundler = watchify(
    browserify(
        _.assign(watchify.args, {
            entries: [paths.jsIn],
            debug: true
        })
    )
);

bundler.transform('babelify', {
    presets: ['es2015', 'react']
});

bundler.on('update', build);

function build() {

    return bundler
        .bundle()
        .on('error', function(error) {
            console.log('Browserify error', error);
        })
        .pipe(source('script.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('js/dist'));
}

gulp.task('build', build);

gulp.task('watch', ['css', 'build'], function() {
    gulp.watch('./scss/*.scss', ['css']);
});

gulp.task('serve', ['watch'], function() {
    server.start();
});

gulp.task('default', ['css', 'build', 'serve']);
