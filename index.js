'use strict';

const postcss = require('postcss');
const { createPropListMatcher } = require('./src/prop-list-matcher.js');
const { getUnitRegexp } = require('./src/pixel-unit-regexp.js');

const defaults = {
    unitToConvert: 'px',
    viewportWidth: 320,
    viewportHeight: 568, // not now used; TODO: need for different units and math for different properties
    unitPrecision: 5,
    viewportUnit: 'vw',
    fontViewportUnit: 'vw',  // vmin is more suitable.
    selectorBlackList: [],
    propList: ['*'],
    minPixelValue: 1,
    mediaQuery: false,
    replace: true,
    landscape: false,
    landscapeUnit: 'vw',
    landscapeWidth: 568
};

function getUnit(prop, opts) {
    return ~prop.indexOf('font') ? opts.fontViewportUnit: opts.viewportUnit;
}

function createPxReplace(opts, viewportUnit, viewportSize) {
    return function (m, $1) {
        if (!$1) {
            return m;
        }

        const pixels = parseFloat($1);

        if (pixels <= opts.minPixelValue) {
            return m;
        }

        const parsedVal = toFixed((pixels / viewportSize * 100), opts.unitPrecision);

        return parsedVal === 0 ? '0' : parsedVal + viewportUnit;
    };
}

function toFixed(number, precision) {
    const multiplier = Math.pow(10, precision + 1);
    const wholeNumber = Math.floor(number * multiplier);

    return Math.round(wholeNumber / 10) * 10 / multiplier;
}

function blacklistedSelector(blacklist, selector) {
    if (typeof selector !== 'string') {
        return;
    }

    return blacklist.some(regex => {
        if (typeof regex === 'string') {
            return selector.indexOf(regex) !== -1;
        }

        return selector.match(regex);
    });
}

function isExclude(reg, file) {
    if (Object.prototype.toString.call(reg) !== '[object RegExp]') {
        throw new Error('options.exclude should be RegExp.');
    }

    return file.match(reg) !== null;
}

function declarationExists(decls, prop, value) {
    return decls.some(decl => decl.prop === prop && decl.value === value);
}

function validateParams(params, mediaQuery) {
    return !params || (params && mediaQuery);
}

module.exports = options => {
    const opts = Object.assign({}, defaults, options);
    const pxRegex = getUnitRegexp(opts.unitToConvert);
    const satisfyPropList = createPropListMatcher(opts.propList);
    const landscapeRules = [];

    return {
        postcssPlugin: 'postcss-px2vw',
        Once(root) {
            root.walkRules(rule => {
                const file = rule.source && rule.source.input.file;

                if (opts.exclude && file) {
                    if (Object.prototype.toString.call(opts.exclude) === '[object RegExp]') {
                        if (isExclude(opts.exclude, file)) {
                            return;
                        }
                    }
                    else if (Object.prototype.toString.call(opts.exclude) === '[object Array]') {
                        for (let i = 0; i < opts.exclude.length; i++) {
                            if (isExclude(opts.exclude[i], file)) {
                                return;
                            }
                        }
                    }
                    else {
                        throw new Error('options.exclude should be RegExp or Array.');
                    }
                }

                if (blacklistedSelector(opts.selectorBlackList, rule.selector)) {
                    return;
                }

                if (opts.landscape && !rule.parent.params) {
                    const landscapeRule = rule.clone().removeAll();

                    rule.walkDecls(decl => {
                        if (decl.value.indexOf(opts.unitToConvert) === -1) {
                            return;
                        }

                        if (!satisfyPropList(decl.prop)) {
                            return;
                        }

                        landscapeRule.append(decl.clone({
                            value: decl.value.replace(pxRegex, createPxReplace(opts, opts.landscapeUnit, opts.landscapeWidth))
                        }));
                    });

                    if (landscapeRule.nodes.length > 0) {
                        landscapeRules.push(landscapeRule);
                    }
                }

                if (!validateParams(rule.parent.params, opts.mediaQuery)) {
                    return;
                }

                rule.walkDecls((decl, i) => {
                    if (decl.value.indexOf(opts.unitToConvert) === -1) {
                        return;
                    }

                    if (!satisfyPropList(decl.prop)) {
                        return;
                    }

                    let unit;
                    let size;
                    const params = rule.parent.params;

                    if (opts.landscape && params && ~params.indexOf('landscape')) {
                        unit = opts.landscapeUnit;
                        size = opts.landscapeWidth;
                    }
                    else {
                        unit = getUnit(decl.prop, opts);
                        size = opts.viewportWidth;
                    }

                    const value = decl.value.replace(pxRegex, createPxReplace(opts, unit, size));

                    if (declarationExists(decl.parent, decl.prop, value)) {
                        return;
                    }

                    if (opts.replace) {
                        decl.value = value;
                    }
                    else {
                        decl.parent.insertAfter(i, decl.clone({ value }));
                    }
                });
            });

            if (landscapeRules.length > 0) {
                const landscapeRoot = new postcss.atRule({ params: '(orientation: landscape)', name: 'media' });

                landscapeRules.forEach(rule => {
                    landscapeRoot.append(rule);
                });

                root.append(landscapeRoot);
            }
        }
    };
};
module.exports.postcss = true;
