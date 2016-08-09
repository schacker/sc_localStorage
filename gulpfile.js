var gulp = require('gulp');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');

gulp.task('jsmin', function(){
    gulp.src('src/scripts/localStorage.js') //压缩多个则传入数组
        .pipe(uglify({
            mangle: {except: ['require' ,'exports' ,'module' ,'$']},//排除混淆关键字
            compress: true,//类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'all' //保留所有注释
        }))
        .pipe(gulp.dest('dist/js'));
});
gulp.task('watch', function(){
    gulp.watch(['./src/test/*.html'], ['html']);
});
gulp.task('connect', function(){
    connect.server({
        root: '.',
        livereload: true
    });
});
gulp.task('html', function(){
    gulp.src('./src/test/*.html')
        .pipe(connect.reload());
});

gulp.task('default', ['jsmin', 'connect', 'watch']);
