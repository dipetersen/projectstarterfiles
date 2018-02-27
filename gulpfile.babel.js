//Load gulp
import gulp from 'gulp'
import creds from './creds.js'

//Load gulp plugins
import babel from 'gulp-babel'
import cleanCSS from 'gulp-clean-css' // clean the css
import concat from 'gulp-concat' //bundle
import gutil from 'gulp-util'
import plumber from 'gulp-plumber'
import rename from 'gulp-rename'
import replace from 'gulp-replace'
import spsave from 'gulp-spsave' //upload to SharePoint
import webpackConfig from './webpack.config.babel'
import webpack from 'webpack'
import del from 'del'
import path from 'path'


const JSSRC = './src/js/*.*'
const CSSSRC = './src/css/*.*'
const DIST = './dist'
const TRANSPILE = './transpile'
const BUILD = './build'
let currentBuild = "DEV"
const appName = "[REPLACE WITH APP NAME]";
const siteAssetsDir = "SiteAssets/" + appName;
const devUrl = "http://spdev/apps/salesorder";
const prodUrl = "http://reinfonet/apps/salesorder";
const testUrl = "http://reinfonet/apps/salesorder/testing";


// COMMON BUILD TASKS

function getUrl(build) {
    switch (currentBuild) {
        case "DEV":
            return devUrl;
            break;
        case "TEST":
            return testUrl;
            break;
        case "PROD":
            return prodUrl;
            break;
    };
    return null;
}

export function deletePrevious() {
    return del([
        './dist/*', './transpile/*', './build/*', './stage/*'
    ])
}
export function moveHtml() {
    return gulp.src('./*.html')
        .pipe(replace('{APPNAME}', appName))
        .pipe(gulp.dest(DIST))
}

export function moveJs() {
    return gulp.src([JSSRC, '!./src/js/config.js', '!./src/js/pimrequest.js'])
        .pipe(gulp.dest(TRANSPILE))
}
export function moveMedia() {
    return gulp.src('./src/assets/**/*.*')
        .pipe(gulp.dest(DIST + '/assets'))
}
export function cleanCss() {
    return gulp.src([CSSSRC])
        .pipe(cleanCSS())
        .pipe(concat(appName + '.min.css'))
        .pipe(gulp.dest('./dist/css'))
}
export function runBabel() {
    return gulp.src(TRANSPILE + '/*.*')
        .pipe(plumber())
        .pipe(babel())
        .pipe(gulp.dest(BUILD));
};
export function runWebpack(callback) {
    var myConfig = Object.create(webpackConfig);
    myConfig.plugins = [
        new webpack.optimize.UglifyJsPlugin({
            output: {
                comments: false
            },
            sourceMap: true
        })
    ];

    webpack(myConfig, (err, stats) => {
        if (err) throw new gutil.PluginError('webpack', err);
        gutil.log('[webpack]', stats.toString({
            colors: true,
            progress: true
        }));
        callback();
    });
}
export function moveDevConfig() {
    currentBuild = "DEV";
    return gulp.src("./src/config/config-dev.js")
        .pipe(rename("config.js"))
        .pipe(gulp.dest(TRANSPILE))
}
export function moveProdConfig() {
    currentBuild = "PROD";
    return gulp.src("./src/config/config-prod.js")
        .pipe(rename("config.js"))
        .pipe(gulp.dest(TRANSPILE))
}
export function moveTestConfig() {
    currentBuild = "TEST";
    return gulp.src("./src/config/config-stage.js")
        .pipe(rename("config.js"))
        .pipe(gulp.dest(TRANSPILE))
}

export function uploadToSharePoint() {
    const url = getUrl(currentBuild);
    if (url == null) return;
    return gulp.src("./dist/**/*.*")
        .pipe(spsave({
            siteUrl: url,
            folder: siteAssetsDir,
            flatten: false
        }, creds));
}

export function uploadJSToSharePoint() {
    const url = getUrl(currentBuild);
    if (url == null) return;
    return gulp.src("./dist/js/*.*")
        .pipe(spsave({
            siteUrl: url,
            folder: siteAssetsDir + "/js",
            flatten: false
        }, creds));
}

export function UploadCSSToSharePoint() {
    const url = getUrl(currentBuild);
    if (url == null) return;
    return gulp.src(["./dist/css/*.*"])
        .pipe(spsave({
            siteUrl: url,
            folder: siteAssetsDir + "/css",
            flatten: false
        }, creds));
}

export function UploadHtml() {
    const url = getUrl(currentBuild);
    if (url == null) return;
    return gulp.src(["./index.html"])
        .pipe(spsave({
            siteUrl: url,
            folder: siteAssetsDir,
            flatten: false
        }, creds));
}

export function UploadAssets() {
    const url = getUrl(currentBuild);
    if (url == null) return;
    return gulp.src("./src/assets/**/*")
        .pipe(spsave({
            siteUrl: url,
            folder: siteAssetsDir + "/assets",
            flatten: false
        }, creds));
}

export const devBuild = gulp.series(
    deletePrevious,
    gulp.parallel(
        moveDevConfig,
        moveJs
    ),
    runBabel,
    runWebpack,
    uploadJSToSharePoint
);
export const DeployToProduction = gulp.series(
    deletePrevious,
    gulp.parallel(
        moveProdConfig,
        moveJs,
        moveMedia,
        moveHtml,
        cleanCss
    ),
    runBabel,
    runWebpack,
    uploadToSharePoint
);

export const Stage = gulp.series(
    deletePrevious,
    gulp.parallel(
        moveTestConfig,
        moveJs,
        moveMedia,
        moveHtml,
        cleanCss
    ),
    runBabel,
    runWebpack,
    uploadToSharePoint
);

export const cssChange = gulp.series(
    cleanCss,
    //moveRawCSS,
    UploadCSSToSharePoint
)

export function watch() {
    gulp.watch('./src/js/*.*', devBuild);
    gulp.watch('./src/css/*.*', cssChange);
    gulp.watch(['./index.html'], UploadHtml);
    gulp.watch('./src/assets/*', UploadAssets);
}
export default watch;