const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const del = require('del');

// ✅ SCSS -> CSS
function styles() {
    return gulp.src('./public/client/assets/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(cleanCSS({ level: 2 }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/client/dist/css'));
}

// ✅ JS -> main.js
function scripts() {
    return gulp.src('./public/client/assets/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/client/dist/js'));
}

// ✅ Clean dist
function clean(done) {
    del(['./public/client/dist/**'], { force: true }).then(() => done());
}

// ✅ Watch source files
function watchFiles() {
    gulp.watch('./public/client/assets/scss/**/*.scss', styles);
    gulp.watch('./public/client/assets/js/**/*.js', scripts);
}

// ✅ Register tasks
gulp.task('build', gulp.series(clean, gulp.parallel(styles, scripts)));
gulp.task('watch', watchFiles);
gulp.task('dev', gulp.series('build', 'watch'));
gulp.task('default', gulp.series('dev'));
