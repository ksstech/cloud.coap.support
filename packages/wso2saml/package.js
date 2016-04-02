Package.describe({
  name: 'ossewawiel:wso2saml',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  connect: "2.7.10",
  xml2js: "0.2.0",
  "xml-crypto": "0.0.20",
  xmldom: "0.1.6",
  fibers: "1.0.7"});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.use('accounts-base@1.0.0');
  api.use('routepolicy@1.0.0');
  api.use('webapp@1.0.2');
  api.use('underscore@1.0.0');
  api.use('service-configuration@1.0.0');
  api.use('http@1.0.2');
  api.addFiles('wso2saml_server.js', 'server');
  api.addFiles('wso2saml_utils.js', 'server');
  api.addFiles('wso2saml_client.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('ossewawiel:wso2saml');
  api.addFiles('wso2saml-tests.js');
});
