import gulp from 'gulp'
import gulpSequence from 'gulp-sequence'

gulp.task('build', gulpSequence(
  'clean', [
    'manifest',
    'images',
    'scripts',
    'hook',
    'chromereload'
  ]
))
