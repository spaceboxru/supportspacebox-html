var $           = require('gulp-load-plugins')();
var argv        = require('yargs').argv;
var browser     = require('browser-sync');
var gulp        = require('gulp');

var panini      = require('panini');
var jade        = require('gulp-jade');

var less        = require('gulp-less');
var path        = require('path');

var rimraf      = require('rimraf');
var sequence    = require('run-sequence');
var sherpa      = require('style-sherpa');
var spritesmith = require('gulp.spritesmith');

// Check for --production flag
var isProduction = !!!(argv.production);

// Port to use for the development server.
var PORT = 8000;

// Browsers to target when prefixing CSS.
var COMPATIBILITY = ['last 2 versions', 'ie >= 9'];

// File paths to various assets are defined here.
var PATHS = {
  assets: [
    'source/assets/**/*',
    '!source/assets/{!img,js,scss,less}/**/*'
  ],
  css: [
	'source/assets/less/vendor/foundation-email/foundation.css'
  ],
  less: [
	// 'bower_components/foundation-sites/scss',
	'source/assets/less/app.less',
    'bower_components/motion-ui/src/'
  ],
  javascript: [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/what-input/what-input.js',

    'bower_components/bootstrap/dist/js/bootstrap.js',

    'bower_components/placeholders/dist/placeholders.jquery.js',
    'bower_components/fancyBox/source/jquery.fancybox.js',
	'source/assets/js/vendor/qtip/jquery.qtip.js',
	
  ],
  javascriptapp: [
    //'source/assets/js/vendor/custom-select/jquery.mousewheel.js',
    //'source/assets/js/vendor/custom-select/jScrollPane.js',
    //'source/assets/js/vendor/custom-select/SelectBox.js',
    //'source/assets/js/vendor/mask-plugin/jquery.mask.js',

    //'source/assets/js/vendor/ninja-slider/ninja-slider.js',
    //'source/assets/js/vendor/ninja-slider/thumbnail-slider.js',
	//'source/assets/js/gallery.js',
    'source/assets/js/app.js'
	]
};

gulp.task('sprite', function () {
	var spriteData = gulp.src('source/assets/img/sprites/*.png').pipe(spritesmith({
		imgName: 'sprites.png',
		cssName: 'sprites.less',
		imgPath: '../img/sprites/sprites.png',
		algorithm: 'binary-tree',
		padding: 10,
		cssTemplate: 'source/assets/less/sprites/template-handlebars/less.template.handlebars'
	}));
	spriteData.css.pipe(gulp.dest('source/assets/less/sprites/'));
	spriteData.img.pipe(gulp.dest('compile/assets/img/sprites/'));
});

// Delete the "dist" folder
// This happens every time a build starts
gulp.task('clean', function(done) {
	rimraf('compile', done);
});

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
gulp.task('copy', function() {
	gulp.src(PATHS.assets)
		.pipe(gulp.dest('compile/assets'));
});

gulp.task('copy:css', function() {
	gulp.src(PATHS.css)
		.pipe(gulp.dest('compile/assets/css/foundation-email'));
});

// Copy page templates into finished HTML files

gulp.task('pages', function() {
	var YOUR_LOCALS = {};

	gulp.src('source/jade/*.jade')
		.pipe(jade({
			locals: YOUR_LOCALS
		}))
		.pipe(gulp.dest('compile'))
});

gulp.task('pages:reset', function(cb) {
	gulp.run('pages');
	cb();
});

gulp.task('styleguide', function(cb) {
	sherpa('source/jade/styleguide/index.md', {
		output: 'compile/styleguide.html',
		template: 'source/jade/styleguide/template.html'
	}, cb);
});

gulp.task('less', function () {

	var uncss = $.if(isProduction, $.uncss({
	html: [
			//'source/templates/**/*.html',
			'compile/**/*.html'
	],
	//html: ['compile/**/*.html'],
	ignore: [
		new RegExp('^meta\..*'),
		new RegExp('^\.is-.*'),
		new RegExp('^\.fancybox.*')
	]
	}));

	var minifycss = $.if(isProduction, $.minifyCss());

	return gulp.src('source/assets/less/app.less')
				.pipe($.sourcemaps.init())
				.pipe(less({
					paths: [
						'source/assets/less/'
					]
				}))
				//.on('error', $.sass.logError))
				.pipe($.autoprefixer({
					browsers: COMPATIBILITY
				}))
				.pipe(uncss)
				.pipe(minifycss)
				.pipe($.if(!isProduction, $.sourcemaps.write()))
				.pipe(gulp.dest('compile/assets/css'));

});

// Combine JavaScript into one file
// In production, the file is minified
gulp.task('javascript', function() {
	//isProduction = true;
	var uglify = $.if(isProduction, $.uglify()
					.on('error', function (e) {
						console.log(e);
					}));

	return gulp.src(PATHS.javascript)
				.pipe($.sourcemaps.init())
				.pipe($.concat('lib.js'))
				.pipe(uglify)
				.pipe($.if(!isProduction, $.sourcemaps.write()))
				.pipe(gulp.dest('compile/assets/js'));
});

gulp.task('javascriptapp', function() {
	/*
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));
*/
	return gulp.src(PATHS.javascriptapp)
				.pipe($.sourcemaps.init())
				.pipe($.concat('app.js'))
				//.pipe(uglify)
				.pipe($.if(!isProduction, $.sourcemaps.write()))
				.pipe(gulp.dest('compile/assets/js'));
});

// Copy images to the "compile" folder
// In production, the images are compressed
gulp.task('images', function() {
	var imagemin = $.if(isProduction, $.imagemin({
		progressive: true
	}));

	return gulp.src('source/assets/img/**/*')
				.pipe(imagemin)
				.pipe(gulp.dest('compile/assets/img'));
});

// Build the "compile" folder by running all of the above tasks
gulp.task('build', function(done) {

	sequence('clean', ['pages', 'less', 'javascript', 'javascriptapp', 'sprite', 'images', 'copy'], 'styleguide', done);

});

// Start a server with LiveReload to preview the site in
gulp.task('server', ['build'], function() {
	browser.init({
		server: 'compile',
		port: PORT,
		reloadDelay: 2000
	});
});

// Build the site, run the server, and watch for file changes
gulp.task('default', ['build', 'server'], function() {
	gulp.watch(PATHS.assets, ['copy', browser.reload]);

	gulp.watch(PATHS.css, ['copy:css', browser.reload]);

	gulp.watch(['source/jade/**/*.jade'], ['pages', browser.reload]);
	gulp.watch(['source/jade/**/*.jade'], ['pages:reset', browser.reload]);
	gulp.watch(['source/assets/less/**/*.less'], ['less', 'copy:css', browser.reload]);
	gulp.watch(['source/assets/js/**/*.js'], ['javascript','javascriptapp', browser.reload]);
	gulp.watch(['source/assets/img/**/*'], ['images', 'sprite', browser.reload]);
	gulp.watch(['source/templates/styleguide/**'], ['styleguide', browser.reload]);
});
