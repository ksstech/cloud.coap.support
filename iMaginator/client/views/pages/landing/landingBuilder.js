LandingInfoFlashData = new Mongo.Collection('landingInfoFlashData');
LandingPlainFeaturesData = new Mongo.Collection('landingPlainFeaturesData');
LandingFeaturesWithPictureData = new Mongo.Collection('landingFeaturesWithPictureData');
LandingPeopleProfileData = new Mongo.Collection('landingPeopleProfileData');
LandingWorkflowData = new Mongo.Collection('landingWorkflowData');
LandingTestimonialsBusyData = new Mongo.Collection('landingTestimonialsBusyData');
LandingTestimonialsPlainData = new Mongo.Collection('landingTestimonialsPlainData');
LandingFeatureGroupData = new Mongo.Collection('landingFeatureGroupData');
LandingContactDetailsData = new Mongo.Collection('landingContactDetailsData');

Template.landingBuilder.rendered = function(){

    $('body').addClass('landing-page');
    $('body').attr('id', 'page-top');

    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 80
    });

    $('a.saml-login').bind('click', function(event, template){
      event.preventDefault();
      var user = Meteor.user();
      if(!user){
        var provider = $(event.target).data('provider');
        Meteor.loginWithSaml({
          provider:provider
        }, function(error, result){
          var user = Meteor.user();
          swal({
              title: "Welcome " + user.username,
              text: "You are now redirecting to iMaginator"
          });
          Router.go('/imaginator');
        });
      } else {
        Router.go('/imaginator');
      }
    });

    // Page scrolling feature
    $('a.page-scroll').bind('click', function(event) {
        var link = $(this);
        $('html, body').stop().animate({
            scrollTop: $(link.attr('href')).offset().top - 50
        }, 500);
        event.preventDefault();
    });

    var cbpAnimatedHeader = (function() {
        var docElem = document.documentElement,
            header = document.querySelector( '.navbar-default' ),
            didScroll = false,
            changeHeaderOn = 200;
        function init() {
            window.addEventListener( 'scroll', function( event ) {
                if( !didScroll ) {
                    didScroll = true;
                    setTimeout( scrollPage, 250 );
                }
            }, false );
        }
        function scrollPage() {
            var sy = scrollY();
            if ( sy >= changeHeaderOn ) {
                $(header).addClass('navbar-scroll')
            }
            else {
                $(header).removeClass('navbar-scroll')
            }
            didScroll = false;
        }
        function scrollY() {
            return window.pageYOffset || docElem.scrollTop;
        }
        init();

    })();

};

Template.landingBuilder.destroyed = function() {
    $('body').removeClass('landing-page');
};

Template.InfoFlash.onCreated(function() {
  var self = this;
  self.autorun(function(){
     var sub = self.subscribe('pubLandingInfoFlash', self.data);
  });
});

Template.InfoFlash.helpers({
  infoFlash: function () {
    var x = LandingInfoFlashData.find().fetch();
    return x[0];
  },
  isActive: function(order) {
    if (order===1) return 'active';
    else return '';
  }

});

Template.PlainFeatures.onCreated(function() {
  var self = this;
  self.autorun(function(){
     var sub = self.subscribe('pubLandingPlainFeatures', self.data);
  });
});

Template.PlainFeatures.helpers({
  plainFeatures: function () {
    var x = LandingPlainFeaturesData.find({sectionId: Template.currentData()}).fetch();
    return x[0];
  }
});

Template.FeaturesWithPicture.onCreated(function() {
  var self = this;
  self.autorun(function(){
     var sub = self.subscribe('pubLandingFeaturesWithPicture', self.data);
  });
});

Template.FeaturesWithPicture.helpers({
  featuresWithPicture: function () {
    var x = LandingFeaturesWithPictureData.find({sectionId: Template.currentData()}).fetch();
    return x[0];
  }
});

Template.PeopleProfile.onCreated(function() {
  var self = this;
  self.autorun(function(){
     var sub = self.subscribe('pubLandingPeopleProfile', self.data);
  });
});

Template.PeopleProfile.helpers({
  peopleProfile: function () {
    var x = LandingPeopleProfileData.find({sectionId: Template.currentData()}).fetch();
    return x[0];
  }
});

Template.Workflow.onCreated(function() {
  var self = this;
  self.autorun(function(){
     var sub = self.subscribe('pubLandingWorkflow', self.data);
  });
});

Template.Workflow.helpers({
  workflow: function () {
    var x = LandingWorkflowData.find({sectionId: Template.currentData()}).fetch();
    return x[0];
  }
});

Template.TestimonialsBusy.onCreated(function() {
  var self = this;
  self.autorun(function(){
     var sub = self.subscribe('pubLandingTestimonialsBusy', self.data);
  });
});

Template.TestimonialsBusy.helpers({
  testimonialsBusy: function () {
    var x = LandingTestimonialsBusyData.find({sectionId: Template.currentData()}).fetch();
    return x[0];
  }
});

Template.TestimonialsPlain.onCreated(function() {
  var self = this;
  self.autorun(function(){
     var sub = self.subscribe('pubLandingTestimonialsPlain', self.data);
  });
});

Template.TestimonialsPlain.helpers({
  testimonialsPlain: function () {
    var x = LandingTestimonialsPlainData.find({sectionId: Template.currentData()}).fetch();
    return x[0];
  }
});

Template.FeatureGroup.onCreated(function() {
  var self = this;
  self.autorun(function(){
     var sub = self.subscribe('pubLandingFeatureGroup', self.data);
  });
});

Template.FeatureGroup.helpers({
  featureGroup: function () {
    var x = LandingFeatureGroupData.find({sectionId: Template.currentData()}).fetch();
    return x[0];
  }
});

Template.ContactDetails.onCreated(function() {
  var self = this;
  self.autorun(function(){
     var sub = self.subscribe('pubLandingContactDetails', self.data);
  });
});

Template.ContactDetails.helpers({
  contactDetails: function () {
    var x = LandingContactDetailsData.find({sectionId: Template.currentData()}).fetch();
    return x[0];
  }
});
