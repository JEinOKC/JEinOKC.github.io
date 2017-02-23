// including plugins
var gulp = require('gulp')
, concat = require('gulp-concat')
, uglify = require('gulp-uglifyjs')
, pump = require('pump')
, babel = require("gulp-babel")
, jshint = require('gulp-jshint')
, stylish = require('jshint-stylish')
, minifyCss = require("gulp-minify-css");
 
// task
gulp.task('minify-css', function () {
    gulp.src(['./dist/main.css']) // path to your file
    .pipe(concat('march-to-madness.min.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('dist'));
});
 
// task
gulp.task('minify-js', function (cb) {
	return gulp.src(['./bracketology/index.js','./dist/main.js'])
		.pipe(babel())
		.pipe(concat('march-to-madness.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
		
		// .pipe(gulp.dest('./dist/march-to-madness.babel.js'));

	// pump([
	// 	gulp.src(['./bracketology/index.js','./dist/main.js']), // path to your files
	// 	babel(),
	// 	uglify(),	
	// 	gulp.dest('./dist/march-to-madness.min.js')
	// 	], cb);
    
});

// task
gulp.task('lint', function() {
  return gulp.src(['./bracketology/index.js','./dist/main.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});