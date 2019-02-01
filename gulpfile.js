const gulp = require('gulp');
const path = require('path');
const less = require('gulp-less');
const cssmin = require('gulp-clean-css');
const rename = require('gulp-rename');
const babel = require("gulp-babel");
const watch = require('gulp-watch');
const sh = require('shelljs');
const isProduction = process.env.NODE_ENV === 'production';
const src = path.join(__dirname, './packages');
const minPath = path.join(__dirname, './miniprogram');
const dist = path.join(__dirname, isProduction ? './dist' : './example/dist');
const kaiUiPath = '/Users/xuchengjie/kaishiba/kai-ui/minicomponent'
const ext = ['js', 'less', 'json', 'wxml'];

function copy(ext) {
  return gulp.src([src + '/**/*.' + ext]).pipe(gulp.dest(dist));
}

gulp.task('do-copy', (done) => {
	const path = minPath + '/*';
  const serverPath = kaiUiPath;
  const command = 'cp -r '+path+' '+serverPath;
  sh.exec(command, function(){
     done();
  })
})

gulp.task('compile-less', () => {
  return gulp.src([src + '/**/*.less'])
    .pipe(less())
    .pipe(cssmin())
    .pipe(
      rename(path => {
        path.extname = '.wxss';
      })
    )
    .pipe(gulp.dest(dist));
});

gulp.task('compile-js', () => copy('js'));
gulp.task('compile-json', () => copy('json'));
gulp.task('compile-wxml', () => copy('wxml'));
gulp.task('build', () => {
	return gulp.src(dist + '/**/*')
    .pipe(gulp.dest(minPath))
    // .pipe(gulp.src(minPath + '/**/*.js'))
}) 

gulp.task('default', () => {
	if (!isProduction) {
		ext.forEach(ext => {
	    return watch(src + '/**/*.' + ext, (e) => {
	      gulp.start('compile-' + ext)
	    });
	  })
	} else {
		console.log('当前环境是生产环境不执行watch命令')
	}
});
