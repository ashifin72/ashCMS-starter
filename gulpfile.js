var syntax = 'sass', // Syntax: sass or scss;
    path = 'app',
    pathcss = 'app/css',
    site = 'ashCMS-starter.loc',
    type = '.html',
    gulpVersion = 4; // Gulp version: 3 or 4
gmWatch = false; // ON/OFF GraphicsMagick watching "img/_src" folder (true/false). Linux install gm: sudo apt update; sudo apt install graphicsmagick

var gulp = require('gulp')
sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleancss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    notify = require('gulp-notify'),
    rsync = require('gulp-rsync'),
    imageResize = require('gulp-image-resize'),
    imagemin = require('gulp-imagemin'),
    del = require('del');

// Local Server
gulp.task('browser-sync', function () {
  browserSync({
    proxy: site,
    notify: false,
    // open: false,
    // online: false, // Work Offline Without Internet Connection
    // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
  })
});

// Sass|Scss Styles
gulp.task('styles', function () {
  return gulp.src('app/' + syntax + '/**/*.' + syntax + '')
      .pipe(sass({outputStyle: 'expanded'}).on("error", notify.onError()))
      .pipe(rename({suffix: '.min', prefix: ''}))
      .pipe(autoprefixer(['last 15 versions']))
      .pipe(cleancss({level: {1: {specialComments: 0}}})) // Opt., comment out when debugging
      .pipe(gulp.dest(pathcss))
      .pipe(browserSync.stream())
});

// JS
gulp.task('scripts', function () {
  return gulp.src([
    path + '/libs/jquery/dist/jquery.min.js',
    path + '/libs/bootstrap/js/bootstrap.bundle.min.js',
    path + '/js/common.js', // Always at the end
  ])
      .pipe(concat('scripts.min.js'))
      // .pipe(uglify()) // Mifify js (opt.)
      .pipe(gulp.dest(path + '/js'))
      .pipe(browserSync.reload({stream: true}))
});

// Images @x1 & @x2 + Compression | Required graphicsmagick (sudo apt update; sudo apt install graphicsmagick)
gulp.task('img1x', function () {
  return gulp.src(path + '/img/_src/**/*.*')
      .pipe(imageResize({width: '50%'}))
      .pipe(imagemin())
      .pipe(gulp.dest(path + '/img/@1x/'))
});
gulp.task('img2x', function () {
  return gulp.src(path + '/img/_src/**/*.*')
      .pipe(imageResize({width: '100%'}))
      .pipe(imagemin())
      .pipe(gulp.dest(path + '/img/@2x/'))
});

// Clean @*x IMG's
gulp.task('cleanimg', function () {
  return del(['app/img/@*'], {force: true})
});

// HTML Live Reload
gulp.task('code', function () {
  return gulp.src(path + '/*' + type)
      .pipe(browserSync.reload({stream: true}))
});


// If Gulp Version 3
if (gulpVersion == 3) {

  // Img Processing Task for Gulp 3
  gulp.task('img', ['img1x', 'img2x']);

  var taskArr = ['styles', 'scripts', 'browser-sync'];
  gmWatch && taskArr.unshift('img');

  gulp.task('watch', taskArr, function () {
    gulp.watch('app/' + syntax + '/**/*.' + syntax + '', ['styles']);
    gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['scripts']);
    gulp.watch('app/*' + type, ['code']);
    gmWatch && gulp.watch('app/img/_src/**/*', ['img']);
  });
  gulp.task('default', ['watch']);

}
;

// If Gulp Version 4
if (gulpVersion == 4) {

  // Img Processing Task for Gulp 4
  gulp.task('img', gulp.parallel('img1x', 'img2x'));

  gulp.task('watch', function () {
    gulp.watch(path + '/' + syntax + '/**/*.' + syntax + '', gulp.parallel('styles'));
    gulp.watch(['libs/**/*.js', 'app/js/common.js'], gulp.parallel('scripts'));
    gulp.watch(path + '/*' + type, gulp.parallel('code'));
    gmWatch && gulp.watch(path + '/img/_src/**/*', gulp.parallel('img')); // GraphicsMagick watching image sources if allowed.
  });
  gmWatch ? gulp.task('default', gulp.parallel('img', 'styles', 'scripts', 'browser-sync', 'watch'))
      : gulp.task('default', gulp.parallel('styles', 'scripts', 'browser-sync', 'watch'));

};