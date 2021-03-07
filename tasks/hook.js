var gulp = require('gulp')
var concat = require('gulp-concat')

gulp.task('hook', [], function () {
  console.log('Concating browserhook to dist/treetabs.js')
  gulp.src(['browserhook/UIController.js',  'browserhook/!(Init)*.js', 'browserhook/Init.js'])
    .pipe(concat('treetabs.js'))
    .pipe(gulp.dest('dist/'))
})
