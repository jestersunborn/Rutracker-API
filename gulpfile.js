/* eslint-disable */

const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

gulp.task('default', () =>
  gulp.src('app/index.js')
  .pipe(babel({ presets: ['env'] }))
  .pipe(uglify())
  .pipe(gulp.dest('build'))
);

gulp.task('watch', () =>
  gulp.watch('app/index.js', ['default'])
);

/* eslint-enable */
