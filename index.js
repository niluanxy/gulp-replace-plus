var through = require('through2');
var rs = require('replacestream');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

function isObject(obj) {
    if (obj == null) return false;

    if (typeof obj !== "object" || obj.nodeType) {
        return false;
    }

    if ( obj.constructor &&
            !({}).hasOwnProperty.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
        return false;
    }

    return true;
}

function isArray(arr) {
    return Array.isArray(arr);
}

function isString(str) {
    return typeof str === "string";
}

function checkStr(test) {
    return (test instanceof RegExp) || isString(test);
}

function replaceCall(contents, replace, isBuffer) {
    var result = isBuffer ? String(contents) : contents;

    replace.forEach(function(item) {
        if (item.match && item.value !== undefined) {
            if (isBuffer) {
                result = result.replace(item.match, item.value);
            } else {
                result = result.pipe(rs(item.match, item.value));
            }
        }
    });

    return isBuffer ? new Buffer(result) : result;
}

function gulpReplace(replaceIn, replaceOf) {
    return through.obj(function(file, encode, callback) {
        var replace = [], contents = file.contents;

        if (checkStr(replaceIn) && isString(replaceOf)) {
            replace.push({
                match: new RegExp(replaceIn),
                value: replaceOf
            });
        } else if (isObject(replaceIn) || isArray(replaceIn)) {
            replace = isArray(replaceIn) ? replaceIn : [replaceIn];
        }

        if (file.isStream()) {
            file.contents = replaceCall(contents, replace, false);
        } else if (file.isBuffer()) {
            file.contents = replaceCall(contents, replace, true);
        }

        this.push(file); return callback(null, file);
    });
};

module.exports = gulpReplace;
