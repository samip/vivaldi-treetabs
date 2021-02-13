var gulp = require('gulp')

gulp.task('instruction', [], function() {
  console.log("Copying install instruction");
  gulp.src(["INSTALL.md"])
    .pipe(gulp.dest('dist'));
});
