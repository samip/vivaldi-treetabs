import gulp from 'gulp'
import gulpSequence from 'gulp-sequence'

gulp.task('dist', gulpSequence(
  'clean', [
    'manifest',
    'images',
    'scripts',
    'hook',
    'instruction',
    'pack'
  ]
))

