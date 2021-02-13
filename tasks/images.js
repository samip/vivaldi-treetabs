import gulp from 'gulp'
import gulpif from 'gulp-if'
import livereload from 'gulp-livereload'
import args from './lib/args'

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest(`dist/extension/images`))
    .pipe(gulpif(args.watch, livereload()))
})
