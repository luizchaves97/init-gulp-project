var gulp        = require('gulp');
var rename      = require("gulp-rename");
var concat      = require('gulp-concat');

var sass        = require('gulp-sass');
var cleanCSS    = require('gulp-clean-css');

var browserify  = require('browserify');
var babelify    = require('babelify');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var uglify      = require('gulp-uglify');
var sourcemaps  = require('gulp-sourcemaps');

var pkg         = require('./package.json');
var browserSync = require('browser-sync').create();



// Compile SCSS
gulp.task('css:compile', function() {
  return gulp.src(['./src/sass/app.scss'])
    .pipe(sass({
      includePaths: ['./src/sass'],
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./dist/css/'+pkg.versionCss))
    .pipe(browserSync.stream())
});

// Minify CSS
gulp.task('css:minify', ['css:compile'], function() {
  return gulp.src([
      './dist/css/'+pkg.versionCss+'/*.css',
      '!./dist/css/'+pkg.versionCss+'/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/css/'+pkg.versionCss))
});

// Compile JS
gulp.task('js:compile', function(){
  return browserify({entries: './src/js/app.js'})
    .transform("babelify", { presets: ["es2015"] })
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(gulp.dest('./dist/js/'+pkg.versionJs))
    .pipe(sourcemaps.write('./maps'))
    .pipe(browserSync.stream())

});

// Minify JS
gulp.task('js:minify', function(){
  return gulp.src([
      './dist/js/'+pkg.versionJs+'/*.js',
      '!./dist/js/'+pkg.versionJs+'/*.min.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/js/'+pkg.versionJs))
});

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});


// Calling the tasks

gulp.task('watch', function(){
    gulp.watch("./src/sass/*/*.scss", ['css:compile']);
    gulp.watch("./src/js/*/*.js", ['js:compile']);
    gulp.watch("./html/*html", browserSync.reload);
});

gulp.task('only-css', ['css:compile', 'css:minify']);

gulp.task('only-js', ['js:compile', 'js:minify']);

gulp.task('default', ['css:compile', 'js:compile', 'browserSync', 'watch']);

gulp.task('build', ['only-css', 'only-js']);

