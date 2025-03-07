/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities used by goog.labs.userAgent tools. These functions
 * should not be used outside of goog.labs.userAgent.*.
 *
 */

goog.provide('goog.labs.userAgent.util');

goog.require('goog.string.internal');

/**
 * @const {boolean} If true, use navigator.userAgentData without check.
 * TODO(user) FEATURESET_YEAR >= 2022 if it supports mobile and all the
 * brands we need.
 */
goog.labs.userAgent.ASSUME_CLIENT_HINTS_SUPPORT = false;

/**
 * @define {boolean} If true, use navigator.userAgentData
 * TODO(user) Flip flag in 2021/12.
 */
goog.labs.userAgent.USE_CLIENT_HINTS =
    goog.define('goog.labs.userAgent.USE_CLIENT_HINTS', false);

/**
 * Gets the native userAgent string from navigator if it exists.
 * If navigator or navigator.userAgent string is missing, returns an empty
 * string.
 * @return {string}
 * @private
 */
goog.labs.userAgent.util.getNativeUserAgentString_ = function() {
  'use strict';
  var navigator = goog.labs.userAgent.util.getNavigator_();
  if (navigator) {
    var userAgent = navigator.userAgent;
    if (userAgent) {
      return userAgent;
    }
  }
  return '';
};

/**
 * Gets the native userAgentData object from navigator if it exists.
 * If navigator or navigator.userAgentData object is missing, returns null
 * @return {?NavigatorUAData}
 * @private
 */
goog.labs.userAgent.util.getNativeUserAgentData_ = function() {
  'use strict';
  const navigator = goog.labs.userAgent.util.getNavigator_();
  // TODO(user): Use navigator?.userAgent ?? null once it's supported.
  if (navigator) {
    return navigator.userAgentData || null;
  }
  return null;
};


/**
 * Getter for the native navigator.
 * This is a separate function so it can be stubbed out in testing.
 * @return {!Navigator}
 * @private
 */
goog.labs.userAgent.util.getNavigator_ = function() {
  'use strict';
  return goog.global.navigator;
};


/**
 * A possible override for applications which wish to not check
 * navigator.userAgent but use a specified value for detection instead.
 * @private {string}
 */
goog.labs.userAgent.util.userAgent_ =
    goog.labs.userAgent.util.getNativeUserAgentString_();


/**
 * Applications may override browser detection on the built in
 * navigator.userAgent object by setting this string. Set to null to use the
 * browser object instead.
 * @param {?string=} opt_userAgent The User-Agent override.
 * @return {void}
 */
goog.labs.userAgent.util.setUserAgent = function(opt_userAgent) {
  'use strict';
  goog.labs.userAgent.util.userAgent_ =
      opt_userAgent || goog.labs.userAgent.util.getNativeUserAgentString_();
};


/**
 * @return {string} The user agent string.
 */
goog.labs.userAgent.util.getUserAgent = function() {
  'use strict';
  return goog.labs.userAgent.util.userAgent_;
};

/**
 * @return {?NavigatorUAData} Navigator.userAgentData if exist
 */
goog.labs.userAgent.util.getUserAgentData = function() {
  'use strict';
  if (!goog.labs.userAgent.USE_CLIENT_HINTS) {
    return null;
  }
  return goog.labs.userAgent.util.getNativeUserAgentData_();
};

/**
 * Checks if any string in userAgentData.brands matches str.
 * Returns false if userAgentData is not supported.
 * @param {string} str
 * @return {boolean} Whether any brand string from userAgentData contains the
 *     given string.
 */
goog.labs.userAgent.util.matchUserAgentDataBrand = function(str) {
  'use strict';
  const data = goog.labs.userAgent.util.getUserAgentData();
  if (!data) return false;
  return data.brands.some(
      ({brand}) => brand && goog.string.internal.contains(brand, str));
};

/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string.
 */
goog.labs.userAgent.util.matchUserAgent = function(str) {
  'use strict';
  var userAgent = goog.labs.userAgent.util.getUserAgent();
  return goog.string.internal.contains(userAgent, str);
};


/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string, ignoring
 *     case.
 */
goog.labs.userAgent.util.matchUserAgentIgnoreCase = function(str) {
  'use strict';
  var userAgent = goog.labs.userAgent.util.getUserAgent();
  return goog.string.internal.caseInsensitiveContains(userAgent, str);
};


/**
 * Parses the user agent into tuples for each section.
 * @param {string} userAgent
 * @return {!Array<!Array<string>>} Tuples of key, version, and the contents
 *     of the parenthetical.
 */
goog.labs.userAgent.util.extractVersionTuples = function(userAgent) {
  'use strict';
  // Matches each section of a user agent string.
  // Example UA:
  // Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us)
  // AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405
  // This has three version tuples: Mozilla, AppleWebKit, and Mobile.

  var versionRegExp = new RegExp(
      // Key. Note that a key may have a space.
      // (i.e. 'Mobile Safari' in 'Mobile Safari/5.0')
      '(\\w[\\w ]+)' +

          '/' +                // slash
          '([^\\s]+)' +        // version (i.e. '5.0b')
          '\\s*' +             // whitespace
          '(?:\\((.*?)\\))?',  // parenthetical info. parentheses not matched.
      'g');

  var data = [];
  var match;

  // Iterate and collect the version tuples.  Each iteration will be the
  // next regex match.
  while (match = versionRegExp.exec(userAgent)) {
    data.push([
      match[1],  // key
      match[2],  // value
      // || undefined as this is not undefined in IE7 and IE8
      match[3] || undefined  // info
    ]);
  }

  return data;
};
