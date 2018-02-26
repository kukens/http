var path = require('path');
var gulp = require('gulp');
var wrap = require('gulp-wrap');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var handlebars = require('gulp-handlebars');
var defineModule = require('gulp-define-module');
var exec = require('gulp-exec');
var clean = require('gulp-clean');

gulp.task('clean', function () {
  return gulp.src('build/', { read: false })
    .pipe(clean());
});



gulp.task('partials', function () {


  return gulp.src(['source/feature/**/*.html'])
    .pipe(handlebars())
    .pipe(wrap('Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
      imports: {
        processPartialName: function (fileName) {
          return JSON.stringify(path.basename(fileName, '.js'));
        }
      }
    }))
    .pipe(concat('partials.js'))
    .pipe(gulp.dest('build/temp/', { overwrite: false }))
});

gulp.task('templates', function () {


  return gulp.src(['source/**/*.html'])
    .pipe(wrap('<%= processPartialName(file.relative) %>', {}, {
      imports: {
        processPartialName: function (fileName) {
          console.log(fileName);
          return 'var template = Handlebars.compile(require("fs").readFileSync("./source/' + fileName.replace(/\\/g, "/") + '", { encoding : "utf-8"})); \n require("fs").writeFileSync("./build/' + fileName.replace(/\\/g, "/") + '", template(), { encoding : "utf-8"});'
        }
      }
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build/temp/'));

});

gulp.task('all', ['clean', 'partials', 'templates'], function () {

  gulp.src('build/temp/*.js')
    .pipe(concat('all.js'))
    .pipe(wrap('var Handlebars = require("handlebars"); \n <%= contents %>', {}))
    .pipe(gulp.dest('build/temp/'));
});



var glob = require('glob');

glob('build/**/*', (er, files) => {
  files.forEach(element => {
    var template = '<a href="' + element + '">' + element + '</a>';
    require("fs").writeFileSync("./build/menu.js", template, { encoding : "utf-8"});
  });
});

