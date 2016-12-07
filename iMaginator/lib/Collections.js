Schemas = {};

Schemas.CollectionItem = new SimpleSchema({
                _id: {type: String, optional: true},
              name: {type: String, index: true,unique: true},
       displayName: {type: String, index: true, },
       description: {type: String, optional: true},
  collectionSource: {type: String},
  icon: {type: String, optional: true}
});

Schemas.CollectionFunction = new SimpleSchema({
  _id: {type: String, optional: true},
  collection: {type: String},
  collectionFunction: {type: String},
  function: {type: String},
  collectionGroup: {type: String}
});

Schemas.CollectionFunctionType = new SimpleSchema({
  _id: {type: String},
  name: {type: String, unique: true},
  description: {type: String, optional: true}
});

Schemas.CollectionSource = new SimpleSchema({
         name: {type: String, index: true, unique: true},
  description: {type: String, optional: true}
});

Schemas.CollectionGroup = new SimpleSchema({
          _id: {type: String},
         name: {type: String, index: true, unique: true},
  description: {type: String, optional: true}
});


Schemas.MenuItemSchema = new SimpleSchema({
          _id: {type: String, optional: true},
          name: {type: String, index: true, unique: true},
   displayName: {type: String, index: true},
   description: {type: String, optional: true},
        parent: {type: String, optional: true},
  menuItemType: {type: String},
          icon: {type: String, optional: true},
         route: {type: String, optional: true},
    collection: {type: String, optional: true},
    dataSource: {type: String, optional: true},
          data: {type: String, optional: true},
         order: {type: Number, defaultValue: 0}
});

Schemas.MenuItemTypeSchema = new SimpleSchema({
         name: {type: String, index: true, unique: true},
  description: {type: String, optional: true}
});

Schemas.DataDefinition = new SimpleSchema({
  collection: {type: String},
  columnName: {type: String, index: true},
  friendlyName: {type: String},
  dataType: {type: String},
  isLookup: {type: Boolean, autoValue: function() { return StringToBool(this.field("isLookup"))}},
  lookupCollectionItem: {type: String, optional: true},
  lookupIdColumn: {type: String, optional: true},
  lookupDisplayColumn: {type: String, optional: true},
  lookupFilterColumn: {type: String, optional: true},
  lookupFilterValueColumn: {type: String, optional: true},
  isPrimary: {type: Boolean, autoValue: function() { return StringToBool(this.field("isPrimary"))}},
  isRequired: {type: Boolean, autoValue: function() { return StringToBool(this.field("isRequired"))}},
  defaultValue: {type: String, optional: true},
  autoIncrement: {type: Boolean, autoValue: function() { return StringToBool(this.field("autoIncrement"))}},
  isDerived: {type: Boolean, autoValue: function() { return StringToBool(this.field("isDerived"))}},
  canEdit: {type: Boolean, autoValue: function() { return StringToBool(this.field("canEdit"))}},
  showInGrid: {type: Boolean, autoValue: function() { return StringToBool(this.field("showInGrid"))}},
  gridOrder: {type: Number, defaultValue: 0},
  detailsOrder: {type: Number, defaultValue: 0}
});

Schemas.ViewType = new SimpleSchema({
  _id: {type: String, optional: true},
  name: {type: String, index: true, unique: true},
  description: {type: String, optional: true}
});

Schemas.View = new SimpleSchema({
  _id: {type: String, optional: true},
  collection: {type: String},
  viewType: {type: String},
  name: {type: String, index: true},
  header: {type: String},
  icon: {type: String},
  groupBy: {type: String, optional: true},
  description: {type: String, optional: true},
  canEdit: {type: Boolean, autoValue: function() { return StringToBool(this.field("canEdit"))}},
});

Schemas.ViewChildren = new SimpleSchema({
  _id: {type: String, optional: true},
  view: {type: String},
  collection: {type: String},
  smartChildType: {type: String},
  order: {type: Number},
  collectionGroup: {type: String}
});

Schemas.ViewColumn = new SimpleSchema({
  _id: {type: String, optional: true},
  view: {type: String},
  collection: {type: String},
  column: {type: String},
  order: {type: Number, defaultValue: 0}
});

Schemas.DataType = new SimpleSchema({
  _id: {type: String},
  name: {type: String, index: true, unique: true},
  description: {type: String, optional: true}
});

Schemas.SmartChildType = new SimpleSchema({
  _id: {type: String},
  name: {type: String, index: true, unique: true},
  description: {type: String, optional: true}
});

Schemas.SmartViewSettings = new SimpleSchema({
  _id: {type: String, optional: true},
  view: {type: String},
  parentWidth: {type: Number},
  parentTabPosition: {type: String},
  parentDetail: {type: Boolean, autoValue: function() { return StringToBool(this.field("parentDetail"))}},
  parentEdit: {type: Boolean, autoValue: function() { return StringToBool(this.field("parentEdit"))}},
  parentDelete: {type: Boolean, autoValue: function() { return StringToBool(this.field("parentDelete"))}},
  parentAdd: {type: Boolean, autoValue: function() { return StringToBool(this.field("parentAdd"))}},
  parentHeaders: {type: Boolean, autoValue: function() { return StringToBool(this.field("parentHeaders"))}},
  parentPaging: {type: Boolean, autoValue: function() { return StringToBool(this.field("parentPaging"))}},
  parentSearch: {type: Boolean, autoValue: function() { return StringToBool(this.field("parentSearch"))}},
  childHeaderSection: {type: Boolean, autoValue: function() { return StringToBool(this.field("childHeaderSection"))}},
  childHeaderView: {type: String, optional: true},
  childDetailType: {type: String}
});

Schemas.tabPosition = new SimpleSchema({
  _id: {type: String},
  name: {type: String, index: true, unique: true}
});

Schemas.childDetailType = new SimpleSchema({
  _id: {type: String},
  name: {type: String, index: true, unique: true}
});

NavMenuItem = new Mongo.Collection("menuItem");
MenuItemType = new Mongo.Collection("menuItemType");
CollectionSource = new Mongo.Collection("collectionSource");
CollectionItem = new Mongo.Collection("collectionItem");
CollectionFunction = new Mongo.Collection("collectionFunction");
CollectionFunctionType = new Mongo.Collection("collectionFunctionType");
DataDefinition = new Mongo.Collection("dataDefinition");
ViewType = new Mongo.Collection("viewType");
ViewCollection = new Mongo.Collection("view");
ViewColumn = new Mongo.Collection("viewColumn");
DataType = new Mongo.Collection("dataType");
SmartChildType = new Mongo.Collection("smartChildType");
ViewChildren = new Mongo.Collection("viewChildren");
CollectionGroup = new Mongo.Collection("collectionGroup");
SmartViewSettings = new Mongo.Collection("smartViewSettings");
TabPosition = new Mongo.Collection("tabPosition");
ChildDetailType = new Mongo.Collection("childDetailType");


NavMenuItem.attachSchema(Schemas.MenuItemSchema);
MenuItemType.attachSchema(Schemas.MenuItemTypeSchema);
CollectionSource.attachSchema(Schemas.CollectionSource);
CollectionItem.attachSchema(Schemas.CollectionItem);
CollectionFunction.attachSchema(Schemas.CollectionFunction);
CollectionFunctionType.attachSchema(Schemas.CollectionFunctionType);
DataDefinition.attachSchema(Schemas.DataDefinition);
ViewType.attachSchema(Schemas.ViewType);
ViewCollection.attachSchema(Schemas.View);
ViewColumn.attachSchema(Schemas.ViewColumn);
DataType.attachSchema(Schemas.DataType);
SmartChildType.attachSchema(Schemas.SmartChildType);
ViewChildren.attachSchema(Schemas.ViewChildren);
CollectionGroup.attachSchema(Schemas.CollectionGroup);
SmartViewSettings.attachSchema(Schemas.SmartViewSettings);
TabPosition.attachSchema(Schemas.tabPosition);
ChildDetailType.attachSchema(Schemas.childDetailType);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Landing Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Schemas.LandingPage = new SimpleSchema({
  _id: {type: String, optional: true},
  name: {type: String},
  adminButtonText: {type: String},
  adminButtonRoute: {type: String},
  description: {type: String}
});

Schemas.LandingPageCollection = new SimpleSchema({
  _id: {type: String, optional: true},
  landingPageId: {type: String, index: true},
  sectionName: {type: String, index: true},
  sectionType: {type: String},
  showInMenu: {type: Boolean, autoValue: function() { return StringToBool(this.field("showInMenu"))}},
  menuText: {type: String, optional: true},
  order: {type: Number}
});

Schemas.LandingSectionType = new SimpleSchema({
  name: {type: String, index: true, unique: true},
  description: {type: String, optional: true}
});

Schemas.InfoFlash = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  name: {type: String}
});

Schemas.InfoFlashCollection = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  backgroundPicturePath: {type: String},
  overlayPicturePath: {type: String, optional: true},
  bigMessage: {type: String},
  smallMessage: {type: String, optional: true},
  tinyHeader: {type: String, optional: true},
  buttonCaption: {type: String, optional: true},
  buttonRoute: {type: String, optional: true},
  order: {type: Number}
});

Schemas.PlainFeatures = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  name: {type: String}
});

Schemas.PlainFeaturesCollection = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  header: {type: String},
  info: {type: String},
  linkText: {type: String, optional: true},
  linkRoute: {type: String, optional: true},
  order: {type: Number}
});

Schemas.FeaturesWithPicture = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  header: {type: String},
  subHeader: {type: String, optional: true},
  info: {type: String, optional: true},
  picturePosition: {type: String, optional: true},
  pictureRoute: {type: String, optional: true}
});

Schemas.FeaturePicturePosition = new SimpleSchema({
  name: {type: String, index: true, unique: true},
  description: {type: String, optional: true}
});

Schemas.FeaturesWithPictureCollection = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  icon: {type: String, optional: true},
  iconPosition: {type: String, optional: true},
  feature: {type: String, optional: true},
  header: {type: String},
  info: {type: String},
  buttonText: {type: String, optional: true},
  buttonRoute: {type: String, optional: true},
  order: {type: Number}
});

Schemas.FeatureIconPosition = new SimpleSchema({
  name: {type: String, index: true, unique: true},
  description: {type: String, optional: true}
});

Schemas.PeopleProfile = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  header: {type: String},
  topInfo: {type: String, optional: true},
  bottomInfo: {type: String, optional: true}
});

Schemas.PeopleProfileCollection = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  photoRoute: {type: String, optional: true},
  bigPhoto: {type: Boolean, autoValue: function() { return StringToBool(this.field("bigPhoto"))}},
  firstName: {type: String},
  lastName: {type: String},
  info: {type: String},
  twitter: {type: String, optional: true},
  facebook: {type: String, optional: true},
  linkedIn: {type: String, optional: true},
  order: {type: Number}
});

Schemas.Workflow = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  header: {type: String},
  info: {type: String, optional: true}
});

Schemas.WorkflowCollection = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  icon: {type: String},
  timeHeader: {type: String},
  timeSub: {type: String},
  infoHeader: {type: String},
  infoText: {type: String},
  infoButtonText: {type: String, optional: true},
  infoButtonRoute: {type: String, optional: true},
  order: {type: Number}
});

Schemas.TestimonialsBusy = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  header: {type: String},
  icon: {type: String, optional: true},
  imageRoute: {type: String}
});

Schemas.TestimonialsBusyCollection = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  quote: {type: String},
  date: {type: String},
  name: {type: String},
  order: {type: Number}
});

Schemas.TestimonialsPlain = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  header: {type: String},
  sub: {type: String, optional: true}
});

Schemas.TestimonialsPlainCollection = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  quote: {type: String},
  info: {type: String},
  name: {type: String},
  photoRoute: {type: String, optional: true},
  order: {type: Number}
});

Schemas.FeatureGroup = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  header: {type: String},
  topSub: {type: String, optional: true},
  bottomSub: {type: String, optional: true}
});

Schemas.FeatureGroupCollection = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  friendlyName : {type: String},
  header: {type: String},
  info: {type: String},
  focus: {type: Boolean, autoValue: function() { return StringToBool(this.field("focus"))}},
  buttonText: {type: String},
  buttonRoute: {type: String},
  order: {type: String}
});

Schemas.FeatureGroupCollectionFeatures = new SimpleSchema({
  _id: {type: String, optional: true},
  featureGroupCollectionId: {type: String, index: true},
  feature: {type: String},
  order: {type: String}
});

Schemas.ContactDetails = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  header: {type: String},
  info: {type: String},
  mailButtonText: {type: String, optional: true},
  mailButtonRoute: {type: String, optional: true},
  socialText: {type: String, optional: true},
  twitter: {type: String, optional: true},
  facebook: {type: String, optional: true},
  linkedIn: {type: String, optional: true},
  trademark: {type: String, optional: true},
  conditions: {type: String, optional: true}
});

Schemas.ContactDetailsCollection = new SimpleSchema({
  _id: {type: String, optional: true},
  sectionId: {type: String, index: true},
  header: {type: String},
  info: {type: String},
  address1: {type: String},
  address2: {type: String},
  address3: {type: String, optional: true},
  address4: {type: String, optional: true},
  address5: {type: String, optional: true},
  phone: {type: String, optional: true},
  email: {type: String, optional: true},
});

LandingPage = new Mongo.Collection("landingPage");
LandingPageCollection = new Mongo.Collection("landingPageCollection");
LandingSectionType = new Mongo.Collection("landingSectionType");
LandingInfoFlash = new Mongo.Collection("landingInfoFlash");
LandingInfoFlashCollection = new Mongo.Collection("landingInfoFlashCollection");
LandingPlainFeatures = new Mongo.Collection("landingPlainFeatures");
LandingPlainFeaturesCollection = new Mongo.Collection("landingPlainFeaturesCollection");
LandingFeaturesWithPicture = new Mongo.Collection("landingFeaturesWithPicture");
LandingFeaturePicturePosition = new Mongo.Collection("landingFeaturePicturePosition");
LandingFeaturesWithPictureCollection = new Mongo.Collection("landingFeaturesWithPictureCollection");
LandingFeatureIconPosition = new Mongo.Collection("landingFeatureIconPosition");
LandingPeopleProfile = new Mongo.Collection("landingPeopleProfile");
LandingPeopleProfileCollection = new Mongo.Collection("landingPeopleProfileCollection");
LandingWorkflow = new Mongo.Collection("landingWorkflow");
LandingWorkflowCollection = new Mongo.Collection("landingWorkflowCollection");
LandingTestimonialsBusy = new Mongo.Collection("landingTestimonialsBusy");
LandingTestimonialsBusyCollection = new Mongo.Collection("landingTestimonialsBusyCollection");
LandingTestimonialsPlain = new Mongo.Collection("landingTestimonialsPlain");
LandingTestimonialsPlainCollection = new Mongo.Collection("landingTestimonialsPlainCollection");
LandingFeatureGroup = new Mongo.Collection("landingFeatureGroup");
LandingFeatureGroupCollection = new Mongo.Collection("landingFeatureGroupCollection");
LandingFeatureGroupCollectionFeatures = new Mongo.Collection("landingFeatureGroupCollectionFeatures");
LandingContactDetails = new Mongo.Collection("landingContactDetails");
LandingContactDetailsCollection = new Mongo.Collection("landingContactDetailsCollection");

LandingPage.attachSchema(Schemas.LandingPage);
LandingPageCollection.attachSchema(Schemas.LandingPageCollection);
LandingSectionType.attachSchema(Schemas.LandingSectionType);
LandingInfoFlash.attachSchema(Schemas.InfoFlash);
LandingInfoFlashCollection.attachSchema(Schemas.InfoFlashCollection);
LandingPlainFeatures.attachSchema(Schemas.PlainFeatures);
LandingPlainFeaturesCollection.attachSchema(Schemas.PlainFeaturesCollection);
LandingFeaturesWithPicture.attachSchema(Schemas.FeaturesWithPicture);
LandingFeaturePicturePosition.attachSchema(Schemas.FeaturePicturePosition)
LandingFeaturesWithPictureCollection.attachSchema(Schemas.FeaturesWithPictureCollection);
LandingFeatureIconPosition.attachSchema(Schemas.FeatureIconPosition);
LandingPeopleProfile.attachSchema(Schemas.PeopleProfile);
LandingPeopleProfileCollection.attachSchema(Schemas.PeopleProfileCollection);
LandingWorkflow.attachSchema(Schemas.Workflow);
LandingWorkflowCollection.attachSchema(Schemas.WorkflowCollection);
LandingTestimonialsBusy.attachSchema(Schemas.TestimonialsBusy);
LandingTestimonialsBusyCollection.attachSchema(Schemas.TestimonialsBusyCollection);
LandingTestimonialsPlain.attachSchema(Schemas.TestimonialsPlain);
LandingTestimonialsPlainCollection.attachSchema(Schemas.TestimonialsPlainCollection);
LandingFeatureGroup.attachSchema(Schemas.FeatureGroup);
LandingFeatureGroupCollection.attachSchema(Schemas.FeatureGroupCollection);
LandingFeatureGroupCollectionFeatures.attachSchema(Schemas.FeatureGroupCollectionFeatures);
LandingContactDetails.attachSchema(Schemas.ContactDetails);
LandingContactDetailsCollection.attachSchema(Schemas.ContactDetailsCollection);

function StringToBool (value) {
  if(value.value==='true' || value.value==='on' || value.value===true) return true;
  else return false;
}
