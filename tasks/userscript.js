var gulp = require('gulp')
var concat = require('gulp-concat')

gulp.task('userscript', [], function () {
  console.log('Concat to dist/treetabs.js')
  gulp.src(['userscript/UIController.js', 'userscript/!(Init)*.js', 'userscript/Init.js'])
    .pipe(concat('treetabs.js'))
    .pipe(gulp.dest('dist/'))
})
