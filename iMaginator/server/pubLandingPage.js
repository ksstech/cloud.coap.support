Meteor.publish("pubLandingPage", function(data){
  var self = this;
  try{
    var landingPage = LandingPage.find({landingPageId: data}).fetch();
    landingPage = landingPage[0];
    var landingPageCollection = LandingPageCollection.find({landingPageId: landingPage._id}, {sort: {order: 1}}).fetch();
    landingPage.collection = landingPageCollection;
    //console.log(landingPage);
    self.added('landingPageData', Random.id(), landingPage);
    self.ready();
  } catch (e) {
    console.log({location: 'pubLandingPage', error: e});
  }
});

Meteor.publish("pubLandingInfoFlash", function(data){
  var self = this;
  try {
    var landingInfoFlash = LandingInfoFlash.find({sectionId: data}).fetch();
    landingInfoFlash = landingInfoFlash[0];
    var landingInfoFlashCollection = LandingInfoFlashCollection.find({sectionId: data}, {sort: {order: 1}}).fetch();
    _.each(landingInfoFlashCollection, function(item){
      if(item.buttonCaption) item.hasButton = true;
      else item.hasButton = false;
      if(item.overlayPicturePath) item.hasOverlayPicture = true;
      else item.hasOverlayPicture = false;
    });
    landingInfoFlash.collection = landingInfoFlashCollection;
    self.added('landingInfoFlashData', Random.id(), landingInfoFlash);
    self.ready();
  } catch (e) {
    console.log({location: 'pubLandingInfoFlash', error: e});
  }
});

Meteor.publish("pubLandingPlainFeatures", function(data){
  var self = this;
  try {
    var landingPlainFeatures = LandingPlainFeatures.find({sectionId: data}).fetch();
    landingPlainFeatures = landingPlainFeatures[0];
    var landingPlainFeaturesCollection = LandingPlainFeaturesCollection.find({sectionId: data}, {sort: {order: 1}}).fetch();
    _.each(landingPlainFeaturesCollection, function(item){
      if(item.linkText) item.hasLink = true;
      else item.linkText = false;
    });
    landingPlainFeatures.collection = landingPlainFeaturesCollection;
    //console.log(landingPlainFeatures);
    self.added('landingPlainFeaturesData', Random.id(), landingPlainFeatures);
    self.ready();
  } catch (e) {
    console.log({location: 'pubLandingPlainFeatures', error: e});
  }
});

Meteor.publish("pubLandingFeaturesWithPicture", function(data){
  var self = this;
  try {
    //console.log({data: data});
    var landingFeaturesWithPicture = LandingFeaturesWithPicture.find({sectionId: data}).fetch();
    landingFeaturesWithPicture = landingFeaturesWithPicture[0];
    if(landingFeaturesWithPicture.subHeader) landingFeaturesWithPicture.hasSubHeader = true;
    else landingFeaturesWithPicture.hasSubHeader = false;
    if(landingFeaturesWithPicture.picturePosition) landingFeaturesWithPicture.hasPicture = true;
    else landingFeaturesWithPicture.hasPicture = false;
    if(landingFeaturesWithPicture.picturePosition==="Left") landingFeaturesWithPicture.pictureLeft = true;
    else landingFeaturesWithPicture.pictureLeft = false;
    if(landingFeaturesWithPicture.picturePosition==="Centre") landingFeaturesWithPicture.pictureCentre = true;
    else landingFeaturesWithPicture.pictureCentre = false;
    if(landingFeaturesWithPicture.picturePosition==="Right") landingFeaturesWithPicture.pictureRight = true;
    else landingFeaturesWithPicture.pictureRight = false;
    if(landingFeaturesWithPicture.hasPicture === false || landingFeaturesWithPicture.pictureCentre === true) {
      landingFeaturesWithPicture.splitFeatures = true;
    } else {
      landingFeaturesWithPicture.splitFeatures = false;
    }
    landingFeaturesWithPicture.colWidth = '6';
    if(landingFeaturesWithPicture.hasPicture === true && landingFeaturesWithPicture.splitFeatures) landingFeaturesWithPicture.colWidth = '3';
    if(landingFeaturesWithPicture.hasPicture === false && landingFeaturesWithPicture.splitFeatures) landingFeaturesWithPicture.colWidth = '5 col-lg-offset-1' ;


    var landingFeaturesWithPictureCollection = LandingFeaturesWithPictureCollection.find({featuresWithPictureId: landingFeaturesWithPicture.featuresWithPictureId}, {sort: {order: 1}}).fetch();

    _.each(landingFeaturesWithPictureCollection, function(item){
      item.hasIcon = item.icon ? true : false;
      item.hasFeature = item.feature ? true : false;
      item.hasButton = item.buttonText ? true : false;
      item.iconTopCentre = item.iconPosition === 'TopCentre' ? true : false;
      item.iconRightCentre = item.iconPosition === 'RightCentre' ? true : false;
    });

    if(landingFeaturesWithPicture.splitFeatures) {
      var col1 = [];
      var col2 = [];
      var i = 0;
      _.each(landingFeaturesWithPictureCollection, function(item){
        if(i===0) {
          i = 1;
          col1.push(item);
        } else {
          i = 0;
          col2.push(item);
        }
      });
      landingFeaturesWithPicture.leftCollection = col1;
      landingFeaturesWithPicture.rightCollection = col2;
    } else {
      landingFeaturesWithPicture.collection = landingFeaturesWithPictureCollection;
    }

    //console.log(landingFeaturesWithPicture);
    self.added('landingFeaturesWithPictureData', Random.id(), landingFeaturesWithPicture);
    self.ready();
  } catch (e) {
    console.log({location: 'pubLandingFeaturesWithPicture', error: e});
  }
});

Meteor.publish("pubLandingPeopleProfile", function(data){
  var self = this;
  try {
    //console.log({data: data});
    var landingPeopleProfile = LandingPeopleProfile.find({sectionId: data}).fetch();
    landingPeopleProfile = landingPeopleProfile[0];
    var landingPeopleProfileCollection = LandingPeopleProfileCollection.find({sectionId: data}, {sort: {order: 1}}).fetch();
    _.each(landingPeopleProfileCollection, function(item){
      if(item.bigPhoto) item.zoomIn = 'zoomIn';
      else item.imageSize = 'img-small';
      item.hasTwitter = item.twitter ? true : false;
      item.hasFacebook = item.facebook ? true : false;
      item.hasLinkedIn = item.linkedIn ? true : false;
    });
    landingPeopleProfile.collection = landingPeopleProfileCollection;
    //console.log(landingPeopleProfile);
    self.added('landingPeopleProfileData', Random.id(), landingPeopleProfile);
    self.ready();
  } catch (e) {
    console.log({location: 'pubLandingPeopleProfile', error: e});
  }
});

Meteor.publish("pubLandingWorkflow", function(data){
  var self = this;
  try {
    //console.log({data: data});
    var landingWorkflow = LandingWorkflow.find({sectionId: data}).fetch();
    landingWorkflow = landingWorkflow[0];
    var landingWorkflowCollection = LandingWorkflowCollection.find({sectionId: data}, {sort: {order: 1}}).fetch();
    _.each(landingWorkflowCollection, function(item){
      item.hasButton = item.infoButtonText ? true : false;
    });
    landingWorkflow.collection = landingWorkflowCollection;
    //console.log(landingWorkflow);
    self.added('landingWorkflowData', Random.id(), landingWorkflow);
    self.ready();
  } catch (e) {
    console.log({location: 'pubLandingWorkflow', error: e});
  }
});

Meteor.publish("pubLandingTestimonialsBusy", function(data){
  var self = this;
  try {
    //console.log({data: data});
    var landingTestimonialsBusy = LandingTestimonialsBusy.find({sectionId: data}).fetch();
    landingTestimonialsBusy = landingTestimonialsBusy[0];
    var landingTestimonialsBusyCollection = LandingTestimonialsBusyCollection.find({sectionId: data}, {sort: {order: 1}}).fetch();
    landingTestimonialsBusy.collection = landingTestimonialsBusyCollection;
    //console.log(landingTestimonialsBusy);
    self.added('landingTestimonialsBusyData', Random.id(), landingTestimonialsBusy);
    self.ready();
  } catch (e) {
    console.log({location: 'pubLandingTestimonialsBusy', error: e});
  }
});

Meteor.publish("pubLandingTestimonialsPlain", function(data){
  var self = this;
  try {
    //console.log({data: data});
    var landingTestimonialsPlain = LandingTestimonialsPlain.find({sectionId: data}).fetch();
    landingTestimonialsPlain = landingTestimonialsPlain[0];
    var landingTestimonialsPlainCollection = LandingTestimonialsPlainCollection.find({sectionId: data}, {sort: {order: 1}}).fetch();
    _.each(landingTestimonialsPlainCollection, function(item){
      item.hasPhoto = item.photoRoute ? true : false;
    });
    landingTestimonialsPlain.collection = landingTestimonialsPlainCollection;
    //console.log(landingTestimonialsPlain);
    self.added('landingTestimonialsPlainData', Random.id(), landingTestimonialsPlain);
    self.ready();
  } catch (e) {
    console.log({location: 'pubLandingTestimonialsPlain', error: e});
  }
});

Meteor.publish("pubLandingFeatureGroup", function(data){
  var self = this;
  try {
    //console.log({data: data});
    var landingFeatureGroup = LandingFeatureGroup.find({sectionId: data}).fetch();
    landingFeatureGroup = landingFeatureGroup[0];
    landingFeatureGroup.hasTopSub = landingFeatureGroup.topSub ? true : false;
    landingFeatureGroup.hasBottomSub = landingFeatureGroup.bottomSub ? true : false;
    var landingFeatureGroupCollection = LandingFeatureGroupCollection.find({sectionId: data}, {sort: {order: 1}}).fetch();
    _.each(landingFeatureGroupCollection, function(item){
      item.hasFocus = item.focus ? 'selected' : '';
      var landingFeatureGroupCollectionFeatures = LandingFeatureGroupCollectionFeatures.find({featureGroupCollectionId: item._id},{sort: {order: 1}}).fetch();
      item.collection = landingFeatureGroupCollectionFeatures;
    });
    landingFeatureGroup.collection = landingFeatureGroupCollection;
    //console.log(landingFeatureGroup);
    self.added('landingFeatureGroupData', Random.id(), landingFeatureGroup);
    self.ready();
  } catch (e) {
    console.log({location: 'pubLandingFeatureGroup', error: e});
  }
});

Meteor.publish("pubLandingContactDetails", function(data){
  var self = this;
  try {
    //console.log({data: data});
    var landingContactDetails = LandingContactDetails.find({sectionId: data}).fetch();
    landingContactDetails = landingContactDetails[0];
    var landingContactDetailsCollection = LandingContactDetailsCollection.find({sectionId: data}, {sort: {order: 1}}).fetch();
    _.each(landingContactDetailsCollection, function(item){
      item.hasPhoto = item.photoRoute ? true : false;
    });
    landingContactDetails.collection = landingContactDetailsCollection;
    //console.log(landingContactDetails);
    self.added('landingContactDetailsData', Random.id(), landingContactDetails);
    self.ready();
  } catch (e) {
    console.log({location: 'pubLandingContactDetails', error: e});
  }
});
