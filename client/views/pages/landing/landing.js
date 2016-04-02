Template.landing.rendered = function(){

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

Template.landing.destroyed = function() {
    $('body').removeClass('landing-page');
};
