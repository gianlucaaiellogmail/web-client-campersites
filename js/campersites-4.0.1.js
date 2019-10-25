// Inizializzazione
//var localeApp = 'en';
var version = '4.0.1';

angular.module('campersites', ['ui.bootstrap', 'ui.router', 'ngSanitize', 'ngMessages', 'pascalprecht.translate', 'tmh.dynamicLocale', 'udpCaptcha', 'ngTouch', 'ng.deviceDetector', 'angular-timeline', 'ngFacebook', 'ngFileUpload', 'blockUI', 'angular-loading-bar', 'ngCookies', 'ngMeta', 'angular-google-analytics']);

// Configurazione, Traduzioni, Stati e Navigazione
angular.module('campersites').config(function($translateProvider, $compileProvider, $stateProvider, $urlRouterProvider, $locationProvider, $facebookProvider, blockUIConfig, cfpLoadingBarProvider, tmhDynamicLocaleProvider, ngMetaProvider, AnalyticsProvider) {
	
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|tel|mailto|ghttps?|ms-appx|x-wmapp0):/);
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|ftp|mailto|content|ms-appx|x-wmapp0):/);

	$translateProvider
	.useStaticFilesLoader({
		prefix: 'locales/locale-',
		suffix: '.json'
	})
	.registerAvailableLanguageKeys(['it', 'en', 'fr'], {
		'en_*': 'en',
		'fr_*': 'fr',
		'it_*': 'it'
	})
	.fallbackLanguage('en', 'it')
	.determinePreferredLanguage()
	.useSanitizeValueStrategy('sanitize')
	.useLocalStorage();

	tmhDynamicLocaleProvider.localeLocationPattern('js/locales/angular-locale_{{locale}}.js');

	$stateProvider
	.state('index', {
		url: '/',
		templateUrl: 'templates/home.html',
		controller: 'homeController'
	})
	.state('condizioni', {
		url: '/terms',
		templateUrl: 'templates/condizioni.html',
		controller: 'condizioniController'
	})
	.state('privacy', {
		url: '/privacy',
		templateUrl: 'templates/privacy.html',
		controller: 'privacyController'
	})
	.state('detail', {
		url: '/detail/{stopId}',
		templateUrl: 'templates/detail.html',
		controller: 'detailController'
	})
	.state('pagedByNation', {
		url: '/nation/{nation}/{page}',
		templateUrl: 'templates/pagedByNation.html',
		controller: 'pagedByNationController'
	})
	.state('activate', {
		url: '/activate/{code}',
		templateUrl: 'templates/activation.html',
		controller: 'activationController'
	})
	.state('restorePwd', {
		url: '/restorePwd/{code}',
		templateUrl: 'templates/restorePwd.html',
		controller: 'restorePwdController'
	})
	.state('modifyArea', {
		url: '/modifyArea/{stopId}',
		templateUrl: 'templates/modify.html',
		controller: 'modifyController'
	})
	.state('preferiti', {
		url: '/preferiti',
		templateUrl: 'templates/preferiti.html',
		controller: 'preferitiController'
	})
	.state('poipersonali', {
		url: '/poipersonali',
		templateUrl: 'templates/poipersonali.html',
		controller: 'poipersonaliController'
	})
	.state('visibile', {
		url: '/visibile/{action}',
		templateUrl: 'templates/visibile.html',
		controller: 'visibileController'
	});
	//$urlRouterProvider.otherwise('/');
	$locationProvider.html5Mode(true);

	$facebookProvider.setAppId('233180500170599');
	//$facebookProvider.setPermissions("email,user_likes");
	$facebookProvider.setCustomInit({
		channelUrl : 'fb/{{locale}}_channel.html', // Channel file for x-domain comms
		status     : true, // Check Facebook Login status
		cookie     : true, // Enable cookies to allow the server to access the session
		xfbml      : true  // Look for social plugins on the page
	});
	$facebookProvider.setVersion("v2.12");

	blockUIConfig.delay = 100;
	blockUIConfig.template = '<div class=\"block-ui-overlay\"></div><div class=\"block-ui-message-container\" aria-live=\"assertive\" aria-atomic=\"true\"><div class=\"block-ui-message\" ng-class=\"$_blockUiMessageClass\"><i class="fa fa-cog fa-spin fa-lg"></i></div></div>';
	// Tell the blockUI service to ignore certain requests
	blockUIConfig.requestFilter = function(config) {
  		// If the request starts with '/stoppoints/bound/' ...
  		if (config.url.match(/\/stoppoints\/bound\//i) ||
  			config.url.match(/\/maps\/vt/i)) {
    		return false; // ... don't block it.
  		}
	};

	cfpLoadingBarProvider.includeSpinner = false;

	ngMetaProvider.useTitleSuffix(true);
	ngMetaProvider.setDefaultTitleSuffix(' | CamperSites.info');
	ngMetaProvider.setOgType('website');
	ngMetaProvider.setOgSiteName('CamperSites.info');
	ngMetaProvider.setDefaultOgImgUrl('img/logo_campersites.png');

	AnalyticsProvider.setAccount('UA-114508-10');
	AnalyticsProvider.setDomainName('campersites.info');
	AnalyticsProvider.setPageEvent('$stateChangeSuccess');

});

// Start up
angular.module('campersites').run( function($rootScope, $translate, ngMeta, Analytics) {
	var currentLocale = $translate.use() || $translate.proposedLanguage();
	if (currentLocale === 'en') {
		currentLocale = 'en_GB';
	} else {
		currentLocale = currentLocale + '_' + currentLocale.toUpperCase();
	}
	// Load the facebook SDK asynchronously
	(function() {
    	// If we've already installed the SDK, we're done
    	if (document.getElementById('facebook-jssdk')) {return;}
    	// Get the first script element, which we'll use to find the parent node
    	var firstScriptElement = document.getElementsByTagName('script')[0];
    	// Create a new script element and set its id
    	var facebookJS = document.createElement('script');
    	facebookJS.id = 'facebook-jssdk';
    	// Set the new script's source to the source of the Facebook JS SDK
    	facebookJS.src = '//connect.facebook.net/'+currentLocale+'/sdk.js';
    	// Insert the Facebook JS SDK into the DOM
    	firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
	}());
});

// Controllers
angular.module('campersites').controller('topController', function($scope, $rootScope, $translate, $modal, $facebook, $state, LocaleService) {
	$scope.isNavCollapsed = false;
	$scope.isDisabled = false;
	$scope.user = null;
	if (localStorage.user) {
		$scope.user = JSON.parse(localStorage.user);
	}
	$scope.currentLocale = $translate.use();
	$scope.menuStatus = {
    	userIsOpen: false,
    	langIsOpen: false
  	};

  	$rootScope.$on('$translateChangeSuccess', function (event, data) {
 		$scope.currentLocale = data.language;
	});

  	$scope.clickHome = function () {
		sessionStorage.mapZoom = JSON.stringify(4);
		sessionStorage.mapCenter = JSON.stringify(new google.maps.LatLng(54.525961, 15.255119)); // Europa;
    };

  	$scope.changeLocale = function (locale) {
		$scope.isNavCollapsed = !$scope.isNavCollapsed;
    	LocaleService.setLocale(locale);
    };

	$scope.openEntra = function () {
		$scope.isNavCollapsed = !$scope.isNavCollapsed;
		$scope.isDisabled = true;
		var modalInstance = $modal.open({
		  animation: true,
		  templateUrl: 'templates/loginRegistra.html',
		  controller: 'loginRegistraController',
		  size: null
		});
		modalInstance.result.then(function () {
			$scope.isDisabled = false;
			if (localStorage.user != null) {
				$scope.user = JSON.parse(localStorage.user);
			}
	    }, function () {
			$scope.isDisabled = false;
		});
	};

	$scope.openContattaci = function () {
		$scope.isNavCollapsed = !$scope.isNavCollapsed;
		$scope.isDisabled = true;
		var modalInstance = $modal.open({
		  animation: true,
		  templateUrl: 'templates/contattaci.html',
		  controller: 'contattaciController',
		  size: null
		});
		modalInstance.result.then(function () {
			$scope.isDisabled = false;
	    }, function () {
			$scope.isDisabled = false;
		});
	};

	$scope.logout = function () {
		localStorage.user = null;
		$scope.user = null
		$state.reload();
	};

	$scope.checkFbStatus = function () {
		$facebook.getLoginStatus().then(function(response) {
			if (response.status !== 'connected') {
				$scope.logout();
			}
		});
	};
	
	$scope.goPreferiti = function () {
		$state.go('preferiti');
	};

	$scope.goPoiPersonali = function () {
		$state.go('poipersonali');
	};

	$scope.toggleUserIsOpen = function () {
		$scope.menuStatus.userIsOpen = !$scope.menuStatus.userIsOpen;
		if ($scope.menuStatus.userIsOpen) {$scope.menuStatus.langIsOpen = false}
	};

	$scope.toggleLangIsOpen = function () {
		$scope.menuStatus.langIsOpen = !$scope.menuStatus.langIsOpen;
		if ($scope.menuStatus.langIsOpen) {$scope.menuStatus.userIsOpen = false}
	};

	if ($scope.user && $scope.user.fbUserId) {
		$scope.checkFbStatus();
	}

	$scope.$on('$stateChangeSuccess', function (event, next) {
		$scope.isNavCollapsed = true;
	});

});

angular.module('campersites').controller('loginRegistraController', function ($scope, $modalInstance, $translate, $http, $facebook, $state) {
	$scope.msg = false;
	$scope.system = false;
	$scope.entrako = false;
	$scope.registramiko = false;
	$scope.unauthorized = false;
	$scope.notAuthentication = false;
	$scope.regOk = false;
	$scope.restorePwd = false;
	$scope.user = {
		email: '',
		password: ''
	};
	$scope.userReg = {
		nickname: '',
		email: '',
		confirmEmail: '',
		password: '',
		confirmPassword: ''
	};
	$scope.fbUser = {
   	    uid: '',
   	    accessToken: '',
   	    nickname: '',
   	    photoPath: '',
   	 	locale: ''
	};

	$scope.toRestore = function() {
		$scope.restorePwd = true;
	};

	$scope.toLogin = function() {
		$scope.restorePwd = false;
	};

	$scope.resetMsgs = function() {
		$scope.msg = false;
		$scope.system = false;
		$scope.unauthorized = false;
		$scope.notAuthentication = false;
		$scope.entrako = false;
		$scope.registramiko = false;
		$scope.regOk = false;
	};

	$scope.login = function(form) {
		form.$submitted = true;
		$scope.resetMsgs();
		if (form.$valid) {
			$http({
			    method: 'POST',
			    url: 'http://www.campersites.info:8082/user/login',
			    data: $scope.user
			}).
			then(function(response) {
				localStorage.user = JSON.stringify(response.data);
				$modalInstance.close();
				$state.reload();
			}, function(response) {
				$scope.msg = true;
				if (response.status === 400) {
					$scope.entrako = true;
					angular.forEach(response.data.errorInfos, function(errorInfo, i) {
						$scope.formEntra[errorInfo.code].$setValidity(errorInfo.message, false);
					});
				} else if (response.status === 401) {
					$scope.unauthorized = true;
				} else if (response.status === 403) {
					$scope.notAuthentication = true;
				} else {
					$scope.system = true;
				}
			});
		}
	};

	$scope.signup = function(form) {
		form.$submitted = true;
		$scope.resetMsgs();
		$scope.formRegistrami.nickname.$setValidity("uniquenickname", true);
		$scope.formRegistrami.email.$setValidity("uniqueemail", true);
		if (form.$valid) {
			$http({
			    method: 'POST',
			    url: 'http://www.campersites.info:8082/user/registra',
			    data: $scope.userReg
			}).
			then(function(response) {
				$scope.msg = true;
				$scope.regOk = true;
			}, function(response) {
				$scope.msg = true;
				if (response.status === 400) {
					$scope.registramiko = true;
					angular.forEach(response.data.errorInfos, function(errorInfo, i) {
						$scope.formRegistrami[errorInfo.code].$setValidity(errorInfo.message, false);
					});
				} else {
					$scope.system = true;
				}
			});
		}
	};

	$scope.fbLogin = function() {
		$scope.resetMsgs();
 		$facebook.login().then(function(response) {
    	    $scope.fbUser.uid = response.authResponse.userID;
    	    $scope.fbUser.accessToken = response.authResponse.accessToken;
			if (response.authResponse) {
				$facebook.api('/me?fields=id,name,locale,picture.width(80).height(80)').then(function(response) {
		    	    $scope.fbUser.nickname = response.name;
		    	    $scope.fbUser.photoPath = response.picture.data.url;
		    	 	$scope.fbUser.locale = response.locale;
					$http({
					    method: 'POST',
					    url: 'http://www.campersites.info:8082/user/fbLogin',
					    data: $scope.fbUser
					}).
					then(function(response) {
						localStorage.user = JSON.stringify(response.data);
						$modalInstance.close();
						$state.reload();
					}, function(response) {
						$scope.msg = true;
						$scope.system = true;
					});
				}, function(response) {
					$scope.msg = true;
					$scope.system = true;
				});
			}
		}, function(response) {
			$scope.msg = true;
			$scope.system = true;
		});
	};

	$scope.activationEmail = function() {
		$scope.resetMsgs();
		if (form.$valid) {
			$http({
			    method: 'POST',
			    url: 'http://www.campersites.info:8082/user/resendActivation',
			    data: $scope.user
			}).
			then(function(response) {
				localStorage.user = JSON.stringify(response.data);
				$modalInstance.close();
				$state.reload();
			}, function(response) {
				$scope.msg = true;
				if (response.status === 400) {
					$scope.entrako = true;
					angular.forEach(response.data.errorInfos, function(errorInfo, i) {
						$scope.formEntra[errorInfo.code].$setValidity(errorInfo.message, false);
					});
				} else if (response.status === 401) {
					$scope.unauthorized = true;
				} else if (response.status === 403) {
					$scope.notAuthentication = true;
				} else {
					$scope.system = true;
				}
			});
		}
	};

	$scope.sendEmailPwd = function(form) {
		form.$submitted = true;
		if (form.$valid) {
			$http({
			    method: 'POST',
			    url: 'http://www.campersites.info:8082/user/emailRestorePwd',
			    data: $scope.user.email
			}).
			then(function(response) {
				$modalInstance.close();
			}, function(response) {
				$scope.msg = true;
				if (response.status === 400) {
					angular.forEach(response.data.errorInfos, function(errorInfo, i) {
						$scope.formEntra[errorInfo.code].$setValidity(errorInfo.message, false);
					});
				} else {
					$scope.system = true;
				}
			});
		}
	};

});

angular.module('campersites').controller('visibileController', function($scope, $modal, $http, $stateParams) {
	$http({
	    method: 'GET',
	    url: 'http://www.campersites.info:8082/user/'+$stateParams.action
	}).
	then(function(response) {
		localStorage.user = JSON.stringify(response.data);
		sessionStorage.visibile = "true";
		document.location.href = "/";
	}, function(response) {
		$modal.open({
			animation: true,
			templateUrl: 'templates/errore.html',
			controller: 'erroreController',
			size: 'sm',
			resolve: {
				response: function () {
	       			return null;
        		}
			}
		});
	});

});

angular.module('campersites').controller('contattaciController', function ($scope, $modalInstance, $captcha, $http) {
	$scope.contact = {
   	    nome: '',
   	    email: '',
   	    messaggio: '',
   	    realPerson: ''
	};

	$scope.contatto = function (form) {
		form.$submitted = true;
		$scope.system = false;
		$scope.formContattaci.realPerson.$setValidity("required", true);
		if (!$captcha.checkResult($scope.contact.realPerson)) {
			$scope.formContattaci.realPerson.$setValidity("required", false);
		} else if (form.$valid) {
			$http({
			    method: 'POST',
			    url: 'http://www.campersites.info:8082/user/contattaci',
			    data: $scope.contact
			}).
			then(function(response) {
				$modalInstance.close();
			}, function(response) {
				if (response.status === 400) {
					angular.forEach(response.data.errorInfos, function(errorInfo, i) {
						$scope.formContattaci[errorInfo.code].$setValidity(errorInfo.message, false);
					});
				} else {
					$scope.system = true;
				}
			});
		}
	};

});

angular.module('campersites').controller('homeController', function($scope, $timeout, $http, $modal, $translate, $state, LoadGoogleMapAPI, LoadRouteBoxer, ngMeta, $window, blockUI) {
	$translate(['label.prezzo', 'label.prezzoNotturno', 'label.prezzoOrario', 'label.prezzoGiornaliero', 'label.prezzoSettimanale', 'label.prezzoParticolare', 'label.acqua', 'label.scaricoCassetta', 'label.scaricoPozzetto', 'label.prezzoService', 'label.corrente', 'label.prezzoCorrente', 'label.tipoPiazzola', 'label.ST', 'label.AS', 'label.ER', 'label.MA', 'label.accessoCustodito', 'label.videosorveglianza', 'label.notte', 'label.illuminazione', 'label.ombra', 'label.docce', 'label.bagni', 'label.bambini', 'label.picnic', 'label.animali', 'label.fermata', 'label.wifi', 'label.si', 'label.no', 'label.gratuito', 'label.posti', 'label.maxHH', 'label.chiusura', 'label.dettaglio', 'label.rating', 'error.gps', 'label.saved']).then(function (translations) {
		$scope.label_prezzo = translations['label.prezzo'];
		$scope.label_prezzoNotturno = translations['label.prezzoNotturno'];
		$scope.label_prezzoOrario = translations['label.prezzoOrario'];
		$scope.label_prezzoGiornaliero = translations['label.prezzoGiornaliero'];
		$scope.label_prezzoSettimanale = translations['label.prezzoSettimanale'];
		$scope.label_prezzoParticolare = translations['label.prezzoParticolare'];
		$scope.label_acqua = translations['label.acqua'];
		$scope.label_scaricoCassetta = translations['label.scaricoCassetta'];
		$scope.label_scaricoPozzetto = translations['label.scaricoPozzetto'];
		$scope.label_prezzoService = translations['label.prezzoService'];
		$scope.label_corrente = translations['label.corrente'];
		$scope.label_prezzoCorrente = translations['label.prezzoCorrente'];
		$scope.label_tipoPiazzola = translations['label.tipoPiazzola'];
		$scope.label_ST = translations['label.ST'];
		$scope.label_AS = translations['label.AS'];
		$scope.label_ER = translations['label.ER'];
		$scope.label_MA = translations['label.MA'];
		$scope.label_accessoCustodito = translations['label.accessoCustodito'];
		$scope.label_videosorveglianza = translations['label.videosorveglianza'];
		$scope.label_notte = translations['label.notte'];
		$scope.label_illuminazione = translations['label.illuminazione'];
		$scope.label_ombra = translations['label.ombra'];
		$scope.label_docce = translations['label.docce'];
		$scope.label_bagni = translations['label.bagni'];
		$scope.label_bambini = translations['label.bambini'];
		$scope.label_picnic = translations['label.picnic'];
		$scope.label_animali = translations['label.animali'];
		$scope.label_fermata = translations['label.fermata'];
		$scope.label_wifi = translations['label.wifi'];
		$scope.label_si = translations['label.si'];
		$scope.label_no = translations['label.no'];
		$scope.label_gratuito = translations['label.gratuito'];
		$scope.label_posti = translations['label.posti'];
		$scope.label_maxHH = translations['label.maxHH'];
		$scope.label_chiusura = translations['label.chiusura'];
		$scope.label_dettaglio = translations['label.dettaglio'];
		$scope.label_rating = translations['label.rating'];
		$scope.error_gps = translations['error.gps'];
		$scope.label_saved = translations['label.saved'];
	});

	$scope.photos = [
		'img/photo/Italia/beautiful_houses-wallpaper-960x540.jpg',
		'img/photo/Francia/camargue-wallpaper-960x540.jpg',
		'img/photo/Germania/cologne_at_night-wallpaper-960x540.jpg',
		'img/photo/Olanda/aerial_view_of_tulip_flower_fields_amsterdam_the_netherlands-wallpaper-960x540.jpg',
		'img/photo/Norvegia/alesund_norway_harbor-wallpaper-960x540.jpg',
		'img/photo/Italia/cloudy_colosseum-wallpaper-960x540.jpg',
		'img/photo/Francia/champagne_ardenne_scenery-wallpaper-960x540.jpg',
		'img/photo/Germania/ferris_wheel_2-wallpaper-960x540.jpg',
		'img/photo/Austria/kitzbuhel_mountain_view_austria_europe-wallpaper-960x540.jpg',
		'img/photo/Belgio/the_groenerei_canal_in_bruges_belgium-wallpaper-960x540.jpg',
		'img/photo/Croazia/sunset_zadar_croatia_8-wallpaper-960x540.jpg',
		'img/photo/Danimarca/blavand_oksby_denmark-wallpaper-960x540.jpg',
		'img/photo/Olanda/bridge_in_holland-wallpaper-960x540.jpg',
		'img/photo/Norvegia/geiranger_norway-wallpaper-960x540.jpg',
		'img/photo/Italia/italian_landscape_2-wallpaper-960x540.jpg',
		'img/photo/Francia/chateau_de_chenonceau-wallpaper-960x540.jpg',
		'img/photo/Germania/hohenzollern_castle_fog_germany-wallpaper-960x540.jpg',
		'img/photo/Slovenia/castle_on_a_island-wallpaper-960x540.jpg',
		'img/photo/Svezia/stockholm_sweden_europe-wallpaper-960x540.jpg',
		'img/photo/Svizzera/chapel_bridge_lucerne_switzerland-wallpaper-960x540.jpg',
		'img/photo/Italia/landro_lake_alta_pusteria_bolzano_district_italy-wallpaper-960x540.jpg',
		'img/photo/Francia/kaysersberg_france-wallpaper-960x540.jpg',
		'img/photo/Germania/karwendel_bavaria_germany-wallpaper-960x540.jpg',
		'img/photo/Olanda/canal_cruiser_amsterdam-wallpaper-960x540.jpg',
		'img/photo/Norvegia/norway_scenery-wallpaper-960x540.jpg',
		'img/photo/Italia/piazza_san_pietro-wallpaper-960x540.jpg',
		'img/photo/Francia/mont_saint_michel_normandy_france-wallpaper-960x540.jpg',
		'img/photo/Germania/neuschwanstein_castle_2-wallpaper-960x540.jpg',
		'img/photo/Olanda/holland_canal-wallpaper-960x540.jpg',
		'img/photo/Italia/venice-wallpaper-960x540.jpg',
		'img/photo/Francia/travel_paris-wallpaper-960x540.jpg',
		'img/photo/Germania/st__bartholomews_church_berchtesgaden_germany-wallpaper-960x540.jpg',
		'img/photo/Italia/villa_deste-wallpaper-960x540.jpg'
	];
	$scope.cercaLuogo = "";
	$scope.mapHeight = window.innerHeight-50; // Tolgo altezza top
	$scope.markers = new Map();
	$scope.flagMarkers = [];
	$scope.visibile = false;
	$scope.user = null;
	if (localStorage.user) {
		$scope.user = JSON.parse(localStorage.user);
	}
	$scope.poiPersonali = new Map();
	$scope.viewPoiPersonali = false;
	$scope.viewRouteTrip = false;
	$scope.tripSteps = [];
	$scope.avoidHighways = false;
	$scope.avoidTolls = false;
	$scope.avoidFerries = false;
	$scope.routes = [];
	$scope.tripSaved = [];
	$scope.currentTrip = {tripId: null, name: null};
	$scope.mapZoom = null;
	if (sessionStorage.mapZoom) {
		$scope.mapZoom = JSON.parse(sessionStorage.mapZoom);
	}
	$scope.mapCenter = null;
	if (sessionStorage.mapCenter) {
		$scope.mapCenter = JSON.parse(sessionStorage.mapCenter);
	}

	ngMeta.setTitle('Home');
	ngMeta.setDescription($translate.instant('desc.description'));

	$scope.shuffleArray = function(array) {
		var m = array.length, t, i;
		// While there remain elements to shuffle
		while (m) {
			// Pick a remaining element?
			i = Math.floor(Math.random() * m--);
		    // And swap it with the current element.
		    t = array[m];
		    array[m] = array[i];
		    array[i] = t;
		}
		return array;
	};
	$scope.shuffledPhotos = $scope.shuffleArray($scope.photos);

	var map = null;
	var infoWindow = null;
	var directionsDisplay = null;
	var directionsService = null;
	var routeBoxer = null;

	var geocoder = null;
	var cercaLuogo = /** @type {HTMLInputElement} */(document.getElementById('cercaLuogo'));
	var autocomplete = null;

	$scope.getBackground = function() {
		return "background-image: url("+$scope.shuffledPhotos[0]+")";
	};

	$scope.cercaVicino = function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				map.setZoom(14);
				map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
				var bodyRect = document.body.getBoundingClientRect(),
				elemRect = document.getElementById('map').getBoundingClientRect(),
				offset   = elemRect.top - bodyRect.top;
				window.scrollTo(0, offset-50);  // Tolgo altezza top
			}, function (response) {
				$modal.open({
					animation: true,
					templateUrl: 'templates/errore.html',
					controller: 'erroreController',
					size: 'sm',
					resolve: {
						response: function () {
	       					return $scope.error_gps;
        				}
					}
				});
			}, {maximumAge: 180000, timeout: 15000, enableHighAccuracy: false});
		} else {
			$modal.open({
				animation: true,
				templateUrl: 'templates/errore.html',
				controller: 'erroreController',
				size: 'sm',
				resolve: {
					response: function () {
       					return $scope.error_gps;
       				}
				}
			});
		}
	};

	$scope.geocodeAddress = function(address) {
		geocoder.geocode({'address': address}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0].geometry.viewport) {
			    	map.fitBounds(results[0].geometry.viewport);
			    } else {
			    	map.setCenter(results[0].geometry.location);
			    	map.setZoom(14);
			    }
				var bodyRect = document.body.getBoundingClientRect(),
				elemRect = document.getElementById('map').getBoundingClientRect(),
				offset   = elemRect.top - bodyRect.top;
				window.scrollTo(0, offset-50);  // Tolgo altezza top
			}
		});
	};

	$scope.cercaLuogoKeypress = function(event) {
		if (event.which === 13) {
			$scope.cercaLuogo = document.getElementById("cercaLuogo").value;
			$scope.geocodeAddress($scope.cercaLuogo);
		}
	};

	$scope.cercaLuogoClick = function() {
		$scope.geocodeAddress($scope.cercaLuogo);
	};

	$scope.goNewArea = function() {
		$state.go('modifyArea');
	}

	$scope.addFlagMarker = function (location, image) {
		var marker = new google.maps.Marker({
			position: location,
			icon: image,
			map: map
		});
		$scope.flagMarkers.push(marker);
		google.maps.event.addListener(marker, 'click', function() {
			map.setCenter(location);
			map.setZoom(6);
		});
	};

	$scope.statiMarkers = function () {
		$scope.addFlagMarker(new google.maps.LatLng(41.87194, 12.56738), '../img/flags/it-48.png'); // Italia
		$scope.addFlagMarker(new google.maps.LatLng(43.94236, 12.45778), '../img/flags/sm-48.png'); // San Marino
		$scope.addFlagMarker(new google.maps.LatLng(46.22764, 2.21375), '../img/flags/fr-48.png'); // Francia
		$scope.addFlagMarker(new google.maps.LatLng(42.50628, 1.52180), '../img/flags/ad-48.png'); // Andorra
		$scope.addFlagMarker(new google.maps.LatLng(49.81527, 6.12958), '../img/flags/lu-48.png'); // Lussemburgo
		$scope.addFlagMarker(new google.maps.LatLng(46.15124, 14.99546), '../img/flags/si-48.png'); // Slovenia
		$scope.addFlagMarker(new google.maps.LatLng(47.16600, 9.55537), '../img/flags/li-48.png'); // Lichtenstein
		$scope.addFlagMarker(new google.maps.LatLng(46.81819, 8.22751), '../img/flags/ch-48.png'); // Svizzera
		$scope.addFlagMarker(new google.maps.LatLng(50.50389, 4.46994), '../img/flags/be-48.png'); // Belgio
		$scope.addFlagMarker(new google.maps.LatLng(45.10000, 15.20000), '../img/flags/hr-48.png'); // Croazia
		$scope.addFlagMarker(new google.maps.LatLng(51.16569, 10.45153), '../img/flags/de-48.png'); // Germania
		$scope.addFlagMarker(new google.maps.LatLng(47.51623, 14.55007), '../img/flags/at-48.png'); // Austria
		$scope.addFlagMarker(new google.maps.LatLng(56.42090, 10.86804), '../img/flags/dk-48.png'); // Danimarca
		$scope.addFlagMarker(new google.maps.LatLng(52.13263, 5.29127), '../img/flags/nl-48.png'); // Olanda
		$scope.addFlagMarker(new google.maps.LatLng(60.12816, 18.64350), '../img/flags/se-48.png'); // Svezia
		$scope.addFlagMarker(new google.maps.LatLng(60.47202, 8.46895), '../img/flags/no-48.png'); // Norvegia
		$scope.addFlagMarker(new google.maps.LatLng(61.92411, 25.74815), '../img/flags/fi-48.png'); // Finlandia
		$scope.addFlagMarker(new google.maps.LatLng(38.92314, 23.38180), '../img/flags/gr-48.png'); // Grecia
		$scope.addFlagMarker(new google.maps.LatLng(40.417932, -3.515246), '../img/flags/es-48.png'); // Spagna
		$scope.addFlagMarker(new google.maps.LatLng(39.719460, -8.155928), '../img/flags/pt-48.png'); // Portogallo
		$scope.addFlagMarker(new google.maps.LatLng(54.485747, -1.993128), '../img/flags/gb-48.png'); // Regno Unito
	};

	$scope.getNotte = function(stopPoint){
		if (stopPoint.notte == 0) return $scope.label_no;
		if (stopPoint.notte == 1) return $scope.label_si;
		return '-';
	};
	$scope.getNotteClass = function(stopPoint){
		if (stopPoint.notte == 0) return 'text-danger';
		if (stopPoint.notte == 1) return 'text-success';
		return '';
	};
	$scope.getPrezzo = function(prezzo){
		if (prezzo === "0") return $scope.label_gratuito;
		if (prezzo != '') return '€ '+prezzo;
		return '-';
	};
	$scope.getPrezzoClass = function(prezzo){
		if (prezzo === "0") return 'text-success';
		if (prezzo != '') return 'text-danger';
		return '';
	};
	$scope.getChiusura = function(stopPoint){
		if (stopPoint.chiusura != null && stopPoint.chiusura != '') return stopPoint.chiusura;
		return '-';
	};

	$scope.setAllFlagMap = function(map) {
		for (var i = 0; i < $scope.flagMarkers.length; i++) {
			$scope.flagMarkers[i].setMap(map);
		}
		$scope.flagMarkers = [];
	};
	$scope.setAllMap = function(map) {
		var entries = $scope.markers.values();
		for (var i = 0; i < $scope.markers.length; i++) {
			entries.get(i).setMap(map);
		}
		$scope.markers.clear();
	};
	
	$scope.setAllPoiMap = function(map) {
		var entries = $scope.poiPersonali.values();
		for (var i = 0; i < $scope.poiPersonali.length; i++) {
			entries.get(i).setMap(map);
		}
		$scope.poiPersonali.clear();
	};
	$scope.togglePoiPersonali = function() {
		$scope.viewPoiPersonali = !$scope.viewPoiPersonali;
		$scope.refreshPoiMapHome();
	}
	
	$scope.toggleRouteTrip = function() {
		$scope.viewRouteTrip = !$scope.viewRouteTrip;
		directionsDisplay.setMap(null);
		$scope.tripSteps = [{name:null},{name:null}];
		$scope.avoidHighways = false;
		$scope.avoidTolls = false;
		$scope.avoidFerries = false;
		$scope.routes = [];
		$scope.tripSaved = [];
		$scope.currentTrip = {tripId: null, name: null};
		$timeout(function() {
			zoom = map.getZoom();
			center = map.getCenter();
			google.maps.event.trigger(map, 'resize');
			map.setZoom(zoom);
			map.setCenter(center);
		});
		if ($scope.viewRouteTrip && $scope.user) {
			$http({
				method: 'GET',
	    		url: 'http://www.campersites.info:8082/trip/',
	    		headers: {'X-User': $scope.user.userId}
	    	}).
	    	then(function(response) {
				$scope.tripSaved = response.data;
			});
		}
	}
	
	$scope.tripKeypress = function(event, tripIndex) {
		if (event.which === 13) {
			$scope.cercaLuogo = document.getElementById(tripIndex+'').value;
			$scope.geocodeAddress($scope.cercaLuogo);
		}
	};

	$scope.saveTrip = function() {
		if ($scope.currentTrip.name) {
			var trip = {
				tripId: $scope.currentTrip.tripId,
				name: $scope.currentTrip.name,
				partenza: $scope.tripSteps[0].name,
				arrivo: $scope.tripSteps[$scope.tripSteps.length - 1].name,
				tappe: []
			};
			if ($scope.tripSteps.length > 2) {
				angular.forEach($scope.tripSteps, function(tripStep, i) {
					if (tripStep.name != undefined && (i > 0 && i < ($scope.tripSteps.length - 1))) {
						trip.tappe.push(tripStep.name);
					}
				});
			}
			$http({
				method: 'POST',
	    		url: 'http://www.campersites.info:8082/trip/',
	    		headers: {'X-User': $scope.user.userId},
	    		data: trip
	    	}).
	    	then(function(response) {
	    		$scope.currentTrip.tripId = response.data.tripId;
				$http({
					method: 'GET',
		    		url: 'http://www.campersites.info:8082/trip/',
		    		headers: {'X-User': $scope.user.userId}
		    	}).
		    	then(function(response) {
					$scope.tripSaved = response.data;
				});
				$modal.open({
					animation: true,
					templateUrl: 'templates/tuttook.html',
					controller: 'tuttoOkController',
					size: 'sm',
					resolve: {
						response: function () {
			       			return $scope.label_saved;
		        		}
					}
				});
			}, function(response) {
				$modal.open({
					animation: true,
					templateUrl: 'templates/errore.html',
					controller: 'erroreController',
					size: 'sm',
					resolve: {
						response: function () {
			       			return null;
		        		}
					}
				});
			});
		}
	}

	$scope.setCurrentTrip = function(selected) {
		if (selected) {
			$scope.currentTrip = selected;
			$scope.tripSteps = [];
			$scope.tripSteps.push({name: $scope.currentTrip.partenza});
			if ($scope.currentTrip.tappe.length > 0) {
				angular.forEach($scope.currentTrip.tappe, function(tappa, i) {
					$scope.tripSteps.push({name: tappa});
				});
			}
			$scope.tripSteps.push({name: $scope.currentTrip.arrivo});
		}
	}

	$scope.routeTrip = function() {
		$scope.$broadcast("autofill:update");
		if ($scope.tripSteps[0].name != undefined && $scope.tripSteps[$scope.tripSteps.length - 1].name != undefined) {
			$scope.routes = [];
			var wayPoints = [];
			if ($scope.tripSteps.length > 2) {
				angular.forEach($scope.tripSteps, function(tripStep, i) {
					if (tripStep.name != undefined && (i > 0 && i < ($scope.tripSteps.length - 1))) {
						wayPoints.push({
			            	location: tripStep.name,
			            	stopover: true
			          	});
					}
				});
			}
		    var request = {
			    origin: $scope.tripSteps[0].name,
			    destination: $scope.tripSteps[$scope.tripSteps.length - 1].name,
			    waypoints: wayPoints,
			    travelMode: google.maps.TravelMode.DRIVING,
			    avoidHighways: $scope.avoidHighways,
			    avoidTolls: $scope.avoidTolls,
			    avoidFerries: $scope.avoidFerries
			};
			directionsService.route(request, function(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setMap(map);
					directionsDisplay.setDirections(response);
					$timeout(function() {
						angular.forEach(response.routes[0].legs, function(leg, i) {
							$scope.routes.push(leg);
						});
					});
					// Box the overview path
					var routeBoxer = new RouteBoxer();
    				var boxes = routeBoxer.box(response.routes[0].overview_path, 5);
					for (var i = 0; i < boxes.length; i++) {
      					$scope.refreshMapTrip(boxes[i]);
    				}
				} else {
					$modal.open({
						animation: true,
						templateUrl: 'templates/errore.html',
						controller: 'erroreController',
						size: 'sm',
						resolve: {
							response: function () {
				       			return null;
			        		}
						}
					});				
				}
			});
		}
	}
	
	$scope.addStep = function() {
		$scope.tripSteps.push({name: undefined});
	}

	$scope.removeStep = function(tripStep) {
		var index = $scope.tripSteps.indexOf(tripStep);
  		$scope.tripSteps.splice(index, 1);
	}

	$scope.refreshMapHome = function() {
		if (map.getZoom() >= 10) {
			$scope.setAllFlagMap(null);
			// Carico punti in mappa
			$http({
				method: 'GET',
	    		url: 'http://www.campersites.info:8082/stoppoints/bound/' + map.getBounds().toUrlValue(),
	    		headers: {'X-Visibile': sessionStorage.visibile}
	    	}).
	    	then(function(response) {
        		angular.forEach(response.data, function(stopPoint, i) {
					if (!$scope.markers.has(stopPoint.stopId)) {
						var iconUrl = '';
						if (stopPoint.visibile == 0) {
							iconUrl = 'img/markers/marker-icon.png';
						} else {
							iconUrl = 'img/markers/'+stopPoint.typeId+'_pin.png';
						}
						var icon = {
							url: iconUrl,
							size: new google.maps.Size(30, 41),
							anchor: new google.maps.Point(15, 40)
						};
						var marker = new google.maps.Marker({
							position: new google.maps.LatLng(stopPoint.latitude, stopPoint.longitude),
							icon: icon,
							id: stopPoint.stopId,
							title: stopPoint.description + ' - ' + stopPoint.locality,
							draggable: false,
							map: map
						});
						var contentString = '<div class="modal-header avatar-left">'+
											'	<img src="img/icons/'+stopPoint.typeId+'.png">'+
											'	<h3 class="text-uppercase text-nowrap" style="margin: 0 0 0px 0; overflow: hidden; text-overflow: ellipsis;">'+stopPoint.description+'</h3>'+
											'	<p>'+stopPoint.locality+'</p>'+
											'</div>'+
											'<div class="modal-body">'+
											'<p style="margin: 0;">'+$scope.label_rating+': <strong>'+stopPoint.rating+'%</strong></p><div class="progress">'+
											'	<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="'+stopPoint.rating+'" aria-valuemin="0" aria-valuemax="100" style="width: '+stopPoint.rating+'%"></div>'+
											'</div>'+
											'<p>'+$scope.label_notte+': <label class="'+$scope.getNotteClass(stopPoint)+'">'+$scope.getNotte(stopPoint)+'</label></p>'+
											'<p>'+$scope.label_prezzo+': <label class="'+$scope.getPrezzoClass(stopPoint.prezzo)+'">'+$scope.getPrezzo(stopPoint.prezzo)+'</label></p>'+
											'<p>'+$scope.label_chiusura+': <label class="text-danger">'+$scope.getChiusura(stopPoint)+'</label></p>'+
											'	<p>';
						if (stopPoint.acqua) contentString = contentString + '<img src="img/icons/acqua.png" title="'+$scope.label_acqua+'" class="padding-right">';
						if (stopPoint.scaricoCassetta) contentString = contentString + '<img src="img/icons/scaricoCassetta.png" title="'+$scope.label_scaricoCassetta+'" class="padding-right">';
						if (stopPoint.scaricoPozzetto) contentString = contentString + '<img src="img/icons/scaricoPozzetto.png" title="'+$scope.label_scaricoPozzetto+'" class="padding-right">';
						if (stopPoint.corrente) contentString = contentString + '<img src="img/icons/corrente.png" title="'+$scope.label_corrente+'" class="padding-right">';
						if (stopPoint.accessoCustodito) contentString = contentString + '<img src="img/icons/accessoCustodito.png" title="'+$scope.label_accessoCustodito+'" class="padding-right">';
						if (stopPoint.videosorveglianza) contentString = contentString + '<img src="img/icons/videosorveglianza.png" title="'+$scope.label_videosorveglianza+'" class="padding-right">';
						if (stopPoint.illuminazione) contentString = contentString + '<img src="img/icons/illuminazione.png" title="'+$scope.label_illuminazione+'" class="padding-right">';
						if (stopPoint.ombra) contentString = contentString + '<img src="img/icons/ombra.png" title="'+$scope.label_ombra+'" class="padding-right">';
						if (stopPoint.docce) contentString = contentString + '<img src="img/icons/docce.png" title="'+$scope.label_docce+'" class="padding-right">';
						if (stopPoint.bagni) contentString = contentString + '<img src="img/icons/bagni.png" title="'+$scope.label_bagni+'" class="padding-right">';
						if (stopPoint.bambini) contentString = contentString + '<img src="img/icons/bambini.png" title="'+$scope.label_bambini+'" class="padding-right">';
						if (stopPoint.picnic) contentString = contentString + '<img src="img/icons/picnic.png" title="'+$scope.label_picnic+'" class="padding-right">';
						if (stopPoint.animali) contentString = contentString + '<img src="img/icons/animali.png" title="'+$scope.label_animali+'" class="padding-right">';
						if (stopPoint.fermata) contentString = contentString + '<img src="img/icons/fermata.png" title="'+$scope.label_fermata+'" class="padding-right">';
						if (stopPoint.wifi) contentString = contentString + '<img src="img/icons/wifi.png" title="'+$scope.label_wifi+'" class="padding-right">';
						contentString = contentString +	'</p>'+
											'</div>'+
											'<div class="modal-footer">'+
											'	<a href="/detail/'+stopPoint.stopId+'" type="button" class="btn btn-primary">'+$scope.label_dettaglio+'</a>'+
											'</div>';
						marker.addListener('click', function() {
							infoWindow.close();
							infoWindow.setContent(contentString);
							infoWindow.open(map, marker);
						});
						$scope.markers.set(stopPoint.stopId, marker);
					}
              	});
	    	}, function(response) {
				$modal.open({
					animation: true,
					templateUrl: 'templates/errore.html',
					controller: 'erroreController',
					size: 'sm',
					resolve: {
						response: function () {
			       			return null;
		        		}
					}
				});
			});
		} else {
			$scope.setAllMap(null);
			$scope.statiMarkers();
			blockUI.reset();
		}
	};

	$scope.refreshMapTrip = function(bound) {
		$scope.setAllMap(null);
		$scope.setAllFlagMap(null);
		// Carico punti in mappa
		$http({
			method: 'GET',
    		url: 'http://www.campersites.info:8082/stoppoints/bound/' + bound.toUrlValue(),
    		headers: {'X-Visibile': sessionStorage.visibile}
    	}).
    	then(function(response) {
       		angular.forEach(response.data, function(stopPoint, i) {
				if (!$scope.markers.has(stopPoint.stopId)) {
					var iconUrl = '';
					if (stopPoint.visibile == 0) {
						iconUrl = 'img/markers/marker-icon.png';
					} else {
						iconUrl = 'img/markers/'+stopPoint.typeId+'_pin.png';
					}
					var icon = {
						url: iconUrl,
						size: new google.maps.Size(30, 41),
						anchor: new google.maps.Point(15, 40)
					};
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(stopPoint.latitude, stopPoint.longitude),
						icon: icon,
						id: stopPoint.stopId,
						title: stopPoint.description + ' - ' + stopPoint.locality,
						draggable: false,
						map: map
					});
					var contentString = '<div class="modal-header avatar-left">'+
										'	<img src="img/icons/'+stopPoint.typeId+'.png">'+
										'	<h3 class="text-uppercase text-nowrap" style="margin: 0 0 0px 0; overflow: hidden; text-overflow: ellipsis;">'+stopPoint.description+'</h3>'+
										'	<p>'+stopPoint.locality+'</p>'+
										'</div>'+
										'<div class="modal-body">'+
										'<p style="margin: 0;">'+$scope.label_rating+': <strong>'+stopPoint.rating+'%</strong></p><div class="progress">'+
										'	<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="'+stopPoint.rating+'" aria-valuemin="0" aria-valuemax="100" style="width: '+stopPoint.rating+'%"></div>'+
										'</div>'+
										'<p>'+$scope.label_notte+': <label class="'+$scope.getNotteClass(stopPoint)+'">'+$scope.getNotte(stopPoint)+'</label></p>'+
										'<p>'+$scope.label_prezzo+': <label class="'+$scope.getPrezzoClass(stopPoint.prezzo)+'">'+$scope.getPrezzo(stopPoint.prezzo)+'</label></p>'+
										'<p>'+$scope.label_chiusura+': <label class="text-danger">'+$scope.getChiusura(stopPoint)+'</label></p>'+
										'	<p>';
					if (stopPoint.acqua) contentString = contentString + '<img src="img/icons/acqua.png" title="'+$scope.label_acqua+'" class="padding-right">';
					if (stopPoint.scaricoCassetta) contentString = contentString + '<img src="img/icons/scaricoCassetta.png" title="'+$scope.label_scaricoCassetta+'" class="padding-right">';
					if (stopPoint.scaricoPozzetto) contentString = contentString + '<img src="img/icons/scaricoPozzetto.png" title="'+$scope.label_scaricoPozzetto+'" class="padding-right">';
					if (stopPoint.corrente) contentString = contentString + '<img src="img/icons/corrente.png" title="'+$scope.label_corrente+'" class="padding-right">';
					if (stopPoint.accessoCustodito) contentString = contentString + '<img src="img/icons/accessoCustodito.png" title="'+$scope.label_accessoCustodito+'" class="padding-right">';
					if (stopPoint.videosorveglianza) contentString = contentString + '<img src="img/icons/videosorveglianza.png" title="'+$scope.label_videosorveglianza+'" class="padding-right">';
					if (stopPoint.illuminazione) contentString = contentString + '<img src="img/icons/illuminazione.png" title="'+$scope.label_illuminazione+'" class="padding-right">';
					if (stopPoint.ombra) contentString = contentString + '<img src="img/icons/ombra.png" title="'+$scope.label_ombra+'" class="padding-right">';
					if (stopPoint.docce) contentString = contentString + '<img src="img/icons/docce.png" title="'+$scope.label_docce+'" class="padding-right">';
					if (stopPoint.bagni) contentString = contentString + '<img src="img/icons/bagni.png" title="'+$scope.label_bagni+'" class="padding-right">';
					if (stopPoint.bambini) contentString = contentString + '<img src="img/icons/bambini.png" title="'+$scope.label_bambini+'" class="padding-right">';
					if (stopPoint.picnic) contentString = contentString + '<img src="img/icons/picnic.png" title="'+$scope.label_picnic+'" class="padding-right">';
					if (stopPoint.animali) contentString = contentString + '<img src="img/icons/animali.png" title="'+$scope.label_animali+'" class="padding-right">';
					if (stopPoint.fermata) contentString = contentString + '<img src="img/icons/fermata.png" title="'+$scope.label_fermata+'" class="padding-right">';
					if (stopPoint.wifi) contentString = contentString + '<img src="img/icons/wifi.png" title="'+$scope.label_wifi+'" class="padding-right">';
					contentString = contentString +	'</p>'+
										'</div>'+
										'<div class="modal-footer">'+
										'	<a href="/detail/'+stopPoint.stopId+'" type="button" class="btn btn-primary">'+$scope.label_dettaglio+'</a>'+
										'</div>';
					marker.addListener('click', function() {
						infoWindow.close();
						infoWindow.setContent(contentString);
						infoWindow.open(map, marker);
					});
					$scope.markers.set(stopPoint.stopId, marker);
				}
           	});
    	}, function(response) {
			$modal.open({
				animation: true,
				templateUrl: 'templates/errore.html',
				controller: 'erroreController',
				size: 'sm',
				resolve: {
					response: function () {
		       			return null;
	        		}
				}
			});
		});
	};

	$scope.refreshPoiMapHome = function() {
		if ($scope.viewPoiPersonali) {
			// Carico punti in mappa
			$http({
				method: 'GET',
	    		url: 'http://www.campersites.info:8082/userpois/bound/' + map.getBounds().toUrlValue(),
	    		headers: {'X-User': $scope.user.userId}
	    	}).
	    	then(function(response) {
        		angular.forEach(response.data, function(userPoi, i) {
					if (!$scope.poiPersonali.has(userPoi.poiId)) {
						var iconUrl = 'img/markers/marker-icon.png';
						var icon = {
							url: iconUrl,
							size: new google.maps.Size(30, 41),
							anchor: new google.maps.Point(15, 40)
						};
						var marker = new google.maps.Marker({
							position: new google.maps.LatLng(userPoi.latitude, userPoi.longitude),
							icon: icon,
							id: userPoi.poiId,
							draggable: false,
							map: map
						});
						var contentString = '<div class="modal-body">'+
											'	<h4 class="text-uppercase text-nowrap" style="margin: 0 0 0px 0; overflow: hidden; text-overflow: ellipsis;">'+userPoi.name+'</h4>'+
											'	<p>'+userPoi.description+'</p>'+
											'</div>';
						marker.addListener('click', function() {
							infoWindow.close();
							infoWindow.setContent(contentString);
							infoWindow.open(map, marker);
						});
						$scope.poiPersonali.set(userPoi.poiId, marker);
					}
              	});
	    	}, function(response) {
	    		$scope.viewPoiPersonali = false;
				$modal.open({
					animation: true,
					templateUrl: 'templates/errore.html',
					controller: 'erroreController',
					size: 'sm',
					resolve: {
						response: function () {
			       			return null;
		        		}
					}
				});
			});
		} else {
			$scope.setAllPoiMap(null);
		}
	};

	$scope.initMap = function () {
		$scope.tripSteps = [{name: null},{name: null}];
		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsService = new google.maps.DirectionsService();

		geocoder = new google.maps.Geocoder();
		autocomplete = new google.maps.places.Autocomplete(cercaLuogo);
		autocomplete.setTypes(['geocode']);
	    google.maps.event.addListener(autocomplete, 'place_changed', function() {
		   	var place = autocomplete.getPlace();
		   	if (place.formatted_address != undefined) {
				$scope.cercaLuogo = place.formatted_address;
				$scope.geocodeAddress($scope.cercaLuogo);
			}
	    });
		
		google.maps.visualRefresh = true;
		var zoom = 4;
		if (sessionStorage.mapZoom) {
			zoom = JSON.parse(sessionStorage.mapZoom);
		}
		var center = new google.maps.LatLng(54.525961, 15.255119); // Europa
		if (sessionStorage.mapCenter) {
			center = JSON.parse(sessionStorage.mapCenter);
		}

		if ($window.innerWidth <= 768) zoom = 2;
		if ($window.innerWidth <= 992) zoom = 3;
		var mapOptions = {
			zoom: zoom,
			minZoom: zoom,
			center: center,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			streetViewControl: true
		};
		map = new google.maps.Map(document.getElementById('map'), mapOptions);
		google.maps.event.addListener(map, 'idle', function() {
			if (!$scope.viewRouteTrip) {
				sessionStorage.mapZoom = JSON.stringify(map.getZoom());
				sessionStorage.mapCenter = JSON.stringify(map.getCenter());
				$scope.refreshMapHome();
			}
			$scope.refreshPoiMapHome();
		});
		$scope.statiMarkers();
		$timeout(function() {
			//routeBoxer = new RouteBoxer();
			zoom = map.getZoom();
			center = map.getCenter();
			google.maps.event.trigger(map, 'resize');
			map.setZoom(zoom);
			map.setCenter(center);
			infoWindow = new google.maps.InfoWindow({maxWidth: 450});
		});
	}

    LoadGoogleMapAPI.then(function () {
	    LoadRouteBoxer.then(function () {
			$scope.initMap();
	    });
    });

});

angular.module('campersites').controller('footerController', function($scope, $http) {
	$scope.nationStats = [];
	$http({
		method: 'GET',
    	url: 'http://www.campersites.info:8082/nationStats/all',
    	cache: true
    }).
    then(function(response) {
		$scope.nationStats = response.data;
    }, function(response) {
	});
	
});

angular.module('campersites').config(function($provide) {
    $provide.decorator('paginationDirective', function($delegate) {
        var directive = $delegate[0];
		directive.$$isolateBindings.nation = {
			attrName: 'nation',
			mode: '@',
			optional: true
		};
        return $delegate;
    });
});

angular.module('campersites').controller('pagedByNationController', function($scope, $http, $stateParams, $modal, $translate, ngMeta) {
	$translate(['label.si', 'label.no', 'label.gratuito']).then(function (translations) {
		$scope.label_si = translations['label.si'];
		$scope.label_no = translations['label.no'];
		$scope.label_gratuito = translations['label.gratuito'];
	});

	$scope.stopPoints = [];
	$scope.nation = $stateParams.nation;
	$scope.currentPage = $stateParams.page;
	$scope.lastPage = false;
	$scope.totalElements = 0;
	$scope.totalPages = 0;
	$scope.pages = [];
	
	ngMeta.setTitle($translate.instant('desc.areesosta') + ' | ' + $translate.instant('nations.'+$scope.nation));
	ngMeta.setDescription($translate.instant('desc.description'));

	$scope.getNotte = function(stopPoint){
		if (stopPoint.notte == 0) return $scope.label_no;
		if (stopPoint.notte == 1) return $scope.label_si;
		return '-';
	};
	$scope.getNotteClass = function(stopPoint){
		if (stopPoint.notte == 0) return 'text-danger';
		if (stopPoint.notte == 1) return 'text-success';
		return '';
	};
	$scope.getPrezzo = function(prezzo){
		if (prezzo === "0") return $scope.label_gratuito;
		if (prezzo != '') return '€ '+prezzo;
		return '-';
	};
	$scope.getPrezzoClass = function(prezzo){
		if (prezzo === "0") return 'text-success';
		if (prezzo != '') return 'text-danger';
		return '';
	};
	$scope.getChiusura = function(stopPoint){
		if (stopPoint.chiusura != null && stopPoint.chiusura != '') return stopPoint.chiusura;
		return '-';
	};
	$scope.noPrevious = function(){
		return $scope.currentPage == 1;
	};
	$scope.noNext = function(){
		return $scope.currentPage == $scope.totalPages;
	};

	if (!$scope.lastPage) {
		$http({
			method: 'GET',
			url: 'http://www.campersites.info:8082/stoppoints/nation/' + $scope.nation + '/' + $scope.currentPage
		}).
		then(function(response) {
			$scope.stopPoints = response.data.content;
			$scope.totalElements = response.data.totalElements;
			$scope.lastPage = response.data.last;
			$scope.totalPages = response.data.totalPages;
			for (i = (Math.max(1, $scope.currentPage - 5)); i <= (Math.min(response.data.totalPages, parseInt($scope.currentPage) + 5)); i++) {
				$scope.pages.push({number: i, active: ($scope.currentPage == i)});
			}
		}, function(response) {
			$modal.open({
				animation: true,
				templateUrl: 'templates/errore.html',
				controller: 'erroreController',
				size: 'sm',
				resolve: {
					response: function () {
		       			return null;
	        		}
				}
			});
		});
	}
	
});

angular.module('campersites').controller('condizioniController', function($scope, $translate, ngMeta) {
	ngMeta.setTitle($translate.instant('label.condizioni'));
	ngMeta.setDescription($translate.instant('desc.description'));

	var bodyRect = document.body.getBoundingClientRect(),
	elemRect = document.getElementById('condizioni').getBoundingClientRect(),
	offset   = elemRect.top - bodyRect.top;
	window.scrollTo(0, offset-50);  // Tolgo altezza top
});

angular.module('campersites').controller('privacyController', function($scope, $translate, ngMeta) {
	ngMeta.setTitle($translate.instant('label.privacy'));
	ngMeta.setDescription($translate.instant('desc.description'));

	var bodyRect = document.body.getBoundingClientRect(),
	elemRect = document.getElementById('privacy').getBoundingClientRect(),
	offset   = elemRect.top - bodyRect.top;
	window.scrollTo(0, offset-50);  // Tolgo altezza top
});

angular.module('campersites').controller('erroreController', function($scope, response) {
	$scope.response = response;
});

angular.module('campersites').controller('tuttoOkController', function($scope, response) {
	$scope.response = response;
});

angular.module('campersites').controller('stopPointsNewestController', function($scope, $http) {
	$scope.stopPointsNewest;
	$scope.errore = false;
	
	$http({
		method: 'GET',
    	url: 'http://www.campersites.info:8082/stoppoints/newest'
    }).
    then(function(response) {
		$scope.stopPointsNewest = response.data;
    }, function(response) {
		$scope.errore = true;
	});
});

angular.module('campersites').controller('stopPointsTopController', function($scope, $http) {
	$scope.stopPointsTop;
	$scope.errore = false;
	
	$http({
		method: 'GET',
    	url: 'http://www.campersites.info:8082/stoppoints/top'
    }).
    then(function(response) {
		$scope.stopPointsTop = response.data;
    }, function(response) {
		$scope.errore = true;
	});
});

angular.module('campersites').controller('usersTopController', function($scope, $http) {
	$scope.usersTop;
	$scope.errore = false;
	
	$http({
		method: 'GET',
    	url: 'http://www.campersites.info:8082/user/top'
    }).
    then(function(response) {
		$scope.usersTop = response.data;
    }, function(response) {
		$scope.errore = true;
	});
});

angular.module('campersites').controller('reviewsNewestController', function($scope, $http) {
	$scope.reviewsNewest;
	$scope.errore = false;
	
	$http({
		method: 'GET',
    	url: 'http://www.campersites.info:8082/reviews/newest'
    }).
    then(function(response) {
		$scope.reviewsNewest = response.data;
    }, function(response) {
		$scope.errore = true;
	});
});

angular.module('campersites').controller('detailController', function ($scope, $http, $translate, $modal, $stateParams, $timeout, $state, deviceDetector, LoadGoogleMapAPI, ngMeta) {
	$translate(['label.prezzo', 'label.prezzoNotturno', 'label.prezzoOrario', 'label.prezzoGiornaliero', 'label.prezzoSettimanale', 'label.prezzoParticolare', 'label.acqua', 'label.scaricoCassetta', 'label.scaricoPozzetto', 'label.prezzoService', 'label.corrente', 'label.prezzoCorrente', 'label.tipoPiazzola', 'label.ST', 'label.AS', 'label.ER', 'label.MA', 'label.accessoCustodito', 'label.videosorveglianza', 'label.notte', 'label.illuminazione', 'label.ombra', 'label.docce', 'label.bagni', 'label.bambini', 'label.picnic', 'label.animali', 'label.fermata', 'label.wifi', 'label.si', 'label.no', 'label.gratuito', 'label.posti', 'label.maxHH', 'label.chiusura', 'label.dettaglio', 'label.rating']).then(function (translations) {
		$scope.label_prezzo = translations['label.prezzo'];
		$scope.label_prezzoNotturno = translations['label.prezzoNotturno'];
		$scope.label_prezzoOrario = translations['label.prezzoOrario'];
		$scope.label_prezzoGiornaliero = translations['label.prezzoGiornaliero'];
		$scope.label_prezzoSettimanale = translations['label.prezzoSettimanale'];
		$scope.label_prezzoParticolare = translations['label.prezzoParticolare'];
		$scope.label_acqua = translations['label.acqua'];
		$scope.label_scaricoCassetta = translations['label.scaricoCassetta'];
		$scope.label_scaricoPozzetto = translations['label.scaricoPozzetto'];
		$scope.label_prezzoService = translations['label.prezzoService'];
		$scope.label_corrente = translations['label.corrente'];
		$scope.label_prezzoCorrente = translations['label.prezzoCorrente'];
		$scope.label_tipoPiazzola = translations['label.tipoPiazzola'];
		$scope.label_ST = translations['label.ST'];
		$scope.label_AS = translations['label.AS'];
		$scope.label_ER = translations['label.ER'];
		$scope.label_MA = translations['label.MA'];
		$scope.label_accessoCustodito = translations['label.accessoCustodito'];
		$scope.label_videosorveglianza = translations['label.videosorveglianza'];
		$scope.label_notte = translations['label.notte'];
		$scope.label_illuminazione = translations['label.illuminazione'];
		$scope.label_ombra = translations['label.ombra'];
		$scope.label_docce = translations['label.docce'];
		$scope.label_bagni = translations['label.bagni'];
		$scope.label_bambini = translations['label.bambini'];
		$scope.label_picnic = translations['label.picnic'];
		$scope.label_animali = translations['label.animali'];
		$scope.label_fermata = translations['label.fermata'];
		$scope.label_wifi = translations['label.wifi'];
		$scope.label_si = translations['label.si'];
		$scope.label_no = translations['label.no'];
		$scope.label_gratuito = translations['label.gratuito'];
		$scope.label_posti = translations['label.posti'];
		$scope.label_maxHH = translations['label.maxHH'];
		$scope.label_chiusura = translations['label.chiusura'];
		$scope.label_dettaglio = translations['label.dettaglio'];
		$scope.label_rating = translations['label.rating'];
	});
	$scope.user = null;
	if (localStorage.user) {
		$scope.user = JSON.parse(localStorage.user);
	}
	$scope.errore = false;
	$scope.stopPoint = {};
	$scope.stopPoint.stopId = $stateParams.stopId;
	$scope.isReviewing = false;
	$scope.review = {
		testo: null
	};
	var photos = $scope.stopPoint.photos = [];
	$scope.url = window.location.href;

	$scope.toggleReviewing = function(){
		$scope.isReviewing = !$scope.isReviewing;
		$scope.review.testo = null;
	};
	$scope.getNotte = function(stopPoint){
		if (stopPoint.notte == 0) return $scope.label_no;
		if (stopPoint.notte == 1) return $scope.label_si;
		return '-';
	};
	$scope.getNotteClass = function(stopPoint){
		if (stopPoint.notte == 0) return 'text-danger';
		if (stopPoint.notte == 1) return 'text-success';
		return '';
	};
	$scope.getPrezzo = function(prezzo){
		if (prezzo === "0") return $scope.label_gratuito;
		if (prezzo != '') return '€ '+prezzo;
		return '-';
	};
	$scope.getPrezzoClass = function(prezzo){
		if (prezzo === "0") return 'text-success';
		if (prezzo != '') return 'text-danger';
		return '';
	};
	$scope.isNavigable = function() {
		if (navigator.geolocation &&
			(deviceDetector.os === 'android' ||
			 deviceDetector.os === 'ios' ||
			 deviceDetector.os === 'windows-phone')) {
			return true;
		}
		return false;
	};
	$scope.hasPhone = function() {
		if (deviceDetector.os === 'android' ||
			deviceDetector.os === 'ios' ||
			deviceDetector.os === 'windows-phone') {
			return true;
		}
		return false;
	};
	$scope.sendToNavigator = function(latitude, longitude) {
		if (deviceDetector.os === 'android') {
			window.open('geo:'+latitude+','+longitude+'?q='+latitude+','+longitude, '_system');
		} else if (deviceDetector.os === 'ios') {
			window.open('maps://'+latitude+','+longitude, '_system');
		} else {
			window.open('geo:'+latitude+','+longitude, '_system');
		}
	};
	$scope.toModify = function() {
		$state.go('modifyArea', {stopId: $scope.stopPoint.stopId});
	};
	$scope.rateIt = function() {
		$http({
			method: 'POST',
	    	url: 'http://www.campersites.info:8082/stoppoints/' + $scope.stopPoint.stopId + '/rate/' + $scope.stopPoint.howRated,
		    headers: {'X-User': $scope.user.userId}
	    }).
	    then(function(response) {
			$scope.stopPoint = response.data;
			photos = $scope.stopPoint.photos;
	    }, function(response) {
			$scope.errore = true;
			$modal.open({
				animation: true,
				templateUrl: 'templates/errore.html',
				controller: 'erroreController',
				size: 'sm',
				resolve: {
					response: function () {
		       			return null;
	        		}
				}
			});
		});
	};
	$scope.togglePreferito = function() {
		$http({
			method: 'POST',
	    	url: 'http://www.campersites.info:8082/stoppoints/preferito/' + $scope.stopPoint.stopId,
		    headers: {'X-User': $scope.user.userId}
	    }).
	    then(function(response) {
			$scope.stopPoint = response.data;
			photos = $scope.stopPoint.photos;
	    }, function(response) {
			$scope.errore = true;
			$modal.open({
				animation: true,
				templateUrl: 'templates/errore.html',
				controller: 'erroreController',
				size: 'sm',
				resolve: {
					response: function () {
		       			return null;
	        		}
				}
			});
		});
	};
	$scope.reviewIt = function(form) {
		if (form.$valid) {
			$http({
				method: 'POST',
		    	url: 'http://www.campersites.info:8082/stoppoints/' + $scope.stopPoint.stopId + '/review',
		    	data: $scope.review,
			    headers: {'X-User': $scope.user.userId}
		    }).
		    then(function(response) {
				$state.reload();
		    }, function(response) {
				$scope.errore = true;
				$modal.open({
					animation: true,
					templateUrl: 'templates/errore.html',
					controller: 'erroreController',
					size: 'sm',
					resolve: {
						response: function () {
			       			return null;
		        		}
					}
				});
			});
		}
	};
	$scope.openPhoto = function() {
		var modalInstance = $modal.open({
		  	animation: true,
		  	templateUrl: 'templates/uploadPhoto.html',
		  	controller: 'uploadPhotoController',
		  	size: 'lg',
			resolve: {
        		stopId: function () {
          			return $scope.stopPoint.stopId;
        		}
      		}
		});
		modalInstance.result.then(function () {
			$state.reload();
	    }, function () {
		});
	};

	var map = null;
	$scope.initMap = function() {
		google.maps.visualRefresh = true;
		var latlang = new google.maps.LatLng($scope.stopPoint.latitude, $scope.stopPoint.longitude);
		var mapOptions = {
			zoom: 15,
			minZoom: 10,
			center: latlang,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			streetViewControl: true
		};
		map = new google.maps.Map(document.getElementById('map'), mapOptions);
		var marker = new google.maps.Marker({
			position: latlang,
			clickable: false,
			icon: '../img/markers/marker-icon.png',
			map: map
		});
		$timeout(function() {
			zoom = map.getZoom();
			center = map.getCenter();
			google.maps.event.trigger(map, 'resize');
			map.setZoom(zoom);
			map.setCenter(center);
		});
	}

	$http({
		method: 'GET',
    	url: 'http://www.campersites.info:8082/stoppoints/' + $scope.stopPoint.stopId,
	    headers: {'X-User': $scope.user ? $scope.user.userId: undefined}
    }).
    then(function(response) {
		$scope.stopPoint = response.data;
		photos = $scope.stopPoint.photos;
	    LoadGoogleMapAPI.then(function () {
			$scope.initMap();
	    })
	    var metaInfo = $translate.instant('label.'+$scope.stopPoint.typeId) + ' | ' + $scope.stopPoint.description + ' | ' + $scope.stopPoint.locality + ' | ' + $translate.instant('nations.'+$scope.stopPoint.nation);
    	ngMeta.setTitle(metaInfo);
		ngMeta.setDescription(metaInfo + ' | ' + $translate.instant('desc.description'));
		if (photos.length > 0) {
			ngMeta.setOgImgUrl('http://www.campersites.info:8000/'+photos[0]);
		}
    }, function(response) {
		$scope.errore = true;
		$modal.open({
			animation: true,
			templateUrl: 'templates/errore.html',
			controller: 'erroreController',
			size: 'sm',
			resolve: {
				response: function () {
	       			return null;
        		}
			}
		});
	});
	
});

angular.module('campersites').controller('activationController', function($scope, $stateParams, $http, $translate, ngMeta) {
	$scope.activated;
	$scope.nickname;

	$http({
		method: 'GET',
    	url: 'http://www.campersites.info:8082/user/activate/' + $stateParams.code
    }).
    then(function(response) {
		$scope.nickname = response.data.nickname;
		$scope.activated = true;
    	ngMeta.setTitle($translate.instant('label.activation'));
		ngMeta.setDescription($translate.instant('desc.description'));
    }, function(response) {
		$scope.activated = false;
	});

});

angular.module('campersites').controller('restorePwdController', function($scope, $stateParams, $http, $state, $translate, ngMeta) {
	$scope.system = false;
	$scope.newPwd = {
		restoreCode: $stateParams.code,
		password: '',
		confirmPassword: ''
	};

   	ngMeta.setTitle($translate.instant('label.restorePwd'));
	ngMeta.setDescription($translate.instant('desc.description'));

	$scope.sendRestorePwd = function(form) {
		form.$submitted = true;
		$scope.system = false;
		if (form.$valid) {
			$http({
			    method: 'POST',
			    url: 'http://www.campersites.info:8082/user/newPwd',
			    data: $scope.newPwd
			}).
			then(function(response) {
				$state.go('index');
			}, function(response) {
				if (response.status === 400) {
					angular.forEach(response.data.errorInfos, function(errorInfo, i) {
						$scope.formRestorePwd[errorInfo.code].$setValidity(errorInfo.message, false);
					});
				} else {
					$scope.system = true;
				}
			});
		}
	};

});

angular.module('campersites').controller('modifyController', function($scope, $translate, $modal, $stateParams, $state, $timeout, $http, LoadGoogleMapAPI, ngMeta, $window) {
	$translate(['label.prezzo', 'label.prezzoNotturno', 'label.prezzoOrario', 'label.prezzoGiornaliero', 'label.prezzoSettimanale', 'label.prezzoParticolare', 'label.acqua', 'label.scaricoCassetta', 'label.scaricoPozzetto', 'label.prezzoService', 'label.corrente', 'label.prezzoCorrente', 'label.tipoPiazzola', 'label.ST', 'label.AS', 'label.ER', 'label.MA', 'label.accessoCustodito', 'label.videosorveglianza', 'label.notte', 'label.illuminazione', 'label.ombra', 'label.docce', 'label.bagni', 'label.bambini', 'label.picnic', 'label.animali', 'label.fermata', 'label.wifi', 'label.si', 'label.no', 'label.gratuito', 'label.posti', 'label.maxHH', 'label.chiusura', 'error.gps', 'error.modificako']).then(function (translations) {
		$scope.label_prezzo = translations['label.prezzo'];
		$scope.label_prezzoNotturno = translations['label.prezzoNotturno'];
		$scope.label_prezzoOrario = translations['label.prezzoOrario'];
		$scope.label_prezzoGiornaliero = translations['label.prezzoGiornaliero'];
		$scope.label_prezzoSettimanale = translations['label.prezzoSettimanale'];
		$scope.label_prezzoParticolare = translations['label.prezzoParticolare'];
		$scope.label_acqua = translations['label.acqua'];
		$scope.label_scaricoCassetta = translations['label.scaricoCassetta'];
		$scope.label_scaricoPozzetto = translations['label.scaricoPozzetto'];
		$scope.label_prezzoService = translations['label.prezzoService'];
		$scope.label_corrente = translations['label.corrente'];
		$scope.label_prezzoCorrente = translations['label.prezzoCorrente'];
		$scope.label_tipoPiazzola = translations['label.tipoPiazzola'];
		$scope.label_ST = translations['label.ST'];
		$scope.label_AS = translations['label.AS'];
		$scope.label_ER = translations['label.ER'];
		$scope.label_MA = translations['label.MA'];
		$scope.label_accessoCustodito = translations['label.accessoCustodito'];
		$scope.label_videosorveglianza = translations['label.videosorveglianza'];
		$scope.label_notte = translations['label.notte'];
		$scope.label_illuminazione = translations['label.illuminazione'];
		$scope.label_ombra = translations['label.ombra'];
		$scope.label_docce = translations['label.docce'];
		$scope.label_bagni = translations['label.bagni'];
		$scope.label_bambini = translations['label.bambini'];
		$scope.label_picnic = translations['label.picnic'];
		$scope.label_animali = translations['label.animali'];
		$scope.label_fermata = translations['label.fermata'];
		$scope.label_wifi = translations['label.wifi'];
		$scope.label_si = translations['label.si'];
		$scope.label_no = translations['label.no'];
		$scope.label_gratuito = translations['label.gratuito'];
		$scope.label_posti = translations['label.posti'];
		$scope.label_maxHH = translations['label.maxHH'];
		$scope.label_chiusura = translations['label.chiusura'];
		$scope.error_gps = translations['error.gps'];
		$scope.error_modificako = translations['error.modificako'];
	});

	$scope.user = null;
	if (localStorage.user) {
		$scope.user = JSON.parse(localStorage.user);
	}
	if (!$scope.user) {
		document.location.href = "/";
	}

	$scope.stopPoint = {
		typeId: 'PS',
		tipoPiazzola: 'ST',
		valuta: 'EUR'
	};

	$scope.cercaLuogo = "";
	$scope.marker = null;
	$scope.markers = new Map();

   	ngMeta.setTitle($translate.instant('label.modifica'));
	ngMeta.setDescription($translate.instant('desc.description'));

	$scope.cercaVicino = function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				map.setZoom(14);
				map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
			}, function (response) {
				$modal.open({
					animation: true,
					templateUrl: 'templates/errore.html',
					controller: 'erroreController',
					size: 'sm',
					resolve: {
						response: function () {
	       					return $scope.error_gps;
        				}
					}
				});
			}, {maximumAge: 180000, timeout: 15000, enableHighAccuracy: false});
		} else {
			$modal.open({
				animation: true,
				templateUrl: 'templates/errore.html',
				controller: 'erroreController',
				size: 'sm',
				resolve: {
					response: function () {
       					return $scope.error_gps;
       				}
				}
			});
		}
	};

	$scope.geocodeAddress = function(address) {
		geocoder.geocode({'address': address}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0].geometry.viewport) {
			    	map.fitBounds(results[0].geometry.viewport);
			    } else {
			    	map.setCenter(results[0].geometry.location);
			    	map.setZoom(14);
			    }
			}
		});
	};

	$scope.cercaLuogoKeypress = function(event) {
		if (event.which === 13) {
			$scope.cercaLuogo = document.getElementById("cercaLuogo").value;
			$scope.geocodeAddress($scope.cercaLuogo);
		}
	};

	$scope.cercaLuogoClick = function() {
		$scope.geocodeAddress($scope.cercaLuogo);
	};

	$scope.setAllMap = function(map) {
		var entries = $scope.markers.values();
		for (var i = 0; i < $scope.markers.length; i++) {
			entries.get(i).setMap(map);
		}
		$scope.markers.clear();
	};

	$scope.findLocation = function(location) {
		geocoder = new google.maps.Geocoder();
		geocoder.geocode ( {'location': location}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var strada = '';
				var luogo = '';
				var admin_3 = '';
				var admin_2 = '';
				for (i = 0; i < results[0].address_components.length; i++) {
					var v = results[0].address_components[i];
					if (v.types[0] == "route") {
						strada = v.long_name;
					} else if (v.types[0] == "locality") {
						luogo = v.long_name;
					} else if (v.types[0] == "administrative_area_level_3") {
						admin_3 = v.long_name;
					}  else if (v.types[0] == "administrative_area_level_2") {
						admin_2 = v.long_name;
					} else if (v.types[0] == "country") {
						$scope.stopPoint.nation = v.short_name;
					}
				}
				if (strada != '') {
					$scope.stopPoint.description = strada;
				}
				if (luogo != '') {
					$scope.stopPoint.locality = luogo;
				} else if (admin_3 != '') {
					$scope.stopPoint.locality = admin_3;
				} else if (admin_2 != '') {
					$scope.stopPoint.locality = admin_2;
				} 
				$scope.marker.setTitle(results[0].formatted_address);
				$scope.$apply();
			}
		});
	};

	$scope.modify = function(form) {
		form.$submitted = true;
		if (form.$valid) {
			for (var property in $scope.stopPoint) {
		    	if ($scope.stopPoint.hasOwnProperty(property)) {
		        	if (property != 'stopId' && property != 'reviews' && property != 'photos') {
		        		if ($scope.stopPoint[property] === '') {
		        			$scope.stopPoint[property] = null;
		        		}
		        	}
		    	}
			}
			$http({
			    method: 'POST',
			    url: 'http://www.campersites.info:8082/stoppoints/',
			    data: $scope.stopPoint,
	    		headers: {'X-User': $scope.user.userId}
			}).
			then(function(response) {
				$state.go('detail', {stopId: +response.data.stopId});
			}, function(response) {
				if (response.status === 400) {
					$modal.open({
						animation: true,
						templateUrl: 'templates/errore.html',
						controller: 'erroreController',
						size: 'sm',
						resolve: {
							response: function () {
		       					return $scope.error_modificako;
		       				}
						}
					});
					angular.forEach(response.data.errorInfos, function(errorInfo, i) {
						$scope.formModifica[errorInfo.code].$setValidity(errorInfo.message, false);
					});
				} else {
					$modal.open({
						animation: true,
						templateUrl: 'templates/errore.html',
						controller: 'erroreController',
						size: 'sm',
						resolve: {
							response: function () {
		       					return null;
		       				}
						}
					});
				}
			});
		}
	};

	$scope.refreshMapHome = function() {
		if (map.getZoom() >= 10) {
			// Carico punti in mappa
			$http({
				method: 'GET',
	    		url: 'http://www.campersites.info:8082/stoppoints/bound/' + map.getBounds().toUrlValue()
	    	}).
	    	then(function(response) {
        		angular.forEach(response.data, function(stopPoint, i) {
					if (!$scope.markers.has(stopPoint.stopId)) {
						var iconUrl = 'img/markers/'+stopPoint.typeId+'_pin.png';
						var icon = {
							url: iconUrl,
							size: new google.maps.Size(30, 41),
							anchor: new google.maps.Point(15, 40)
						};
						var marker = new google.maps.Marker({
							position: new google.maps.LatLng(stopPoint.latitude, stopPoint.longitude),
							icon: icon,
							id: stopPoint.stopId,
							title: stopPoint.description + ' - ' + stopPoint.locality,
							draggable: false,
							map: map
						});
						var contentString = '<div class="modal-body avatar-left">'+
											'	<img src="img/icons/'+stopPoint.typeId+'.png">'+
											'	<h4 class="text-uppercase text-nowrap" style="margin: 0 0 0px 0; overflow: hidden; text-overflow: ellipsis;">'+stopPoint.description+'</h4>'+
											'	<p>'+stopPoint.locality+'</p>'+
											'</div>';
						marker.addListener('click', function() {
							infoWindow.close();
							infoWindow.setContent(contentString);
							infoWindow.open(map, marker);
						});
						$scope.markers.set(stopPoint.stopId, marker);
					}
              	});
	    	}, function(response) {
				$modal.open({
					animation: true,
					templateUrl: 'templates/errore.html',
					controller: 'erroreController',
					size: 'sm',
					resolve: {
						response: function () {
			       			return null;
		        		}
					}
				});
			});
		} else {
			$scope.setAllMap(null);
		}
	};

	var geocoder = null;
	var cercaLuogo = /** @type {HTMLInputElement} */(document.getElementById('cercaLuogo'));
	var autocomplete = null;
	
	var map = null;
	var infoWindow = null;
	$scope.initMap = function() {
		geocoder = new google.maps.Geocoder();
		autocomplete = new google.maps.places.Autocomplete(cercaLuogo);
		autocomplete.setTypes(['geocode']);
	    google.maps.event.addListener(autocomplete, 'place_changed', function() {
		   	var place = autocomplete.getPlace();
		   	if (place.formatted_address != undefined) {
				$scope.cercaLuogo = place.formatted_address;
				$scope.geocodeAddress($scope.cercaLuogo);
			}
	    });
		google.maps.visualRefresh = true;
		var mapOptions;
		if ($scope.stopPoint.latitude && $scope.stopPoint.longitude) {
			mapOptions = {
				zoom: 16,
				minZoom: 2,
				center: new google.maps.LatLng($scope.stopPoint.latitude, $scope.stopPoint.longitude),
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				streetViewControl: true
			};
			map = new google.maps.Map(document.getElementById('map'), mapOptions);
			$scope.marker = new google.maps.Marker({
				position: new google.maps.LatLng($scope.stopPoint.latitude, $scope.stopPoint.longitude),
				icon: 'img/markers/marker-icon.png',
				draggable: true,
				map: map
			});
			$scope.markers.set($scope.stopPoint.stopId, $scope.marker);
			google.maps.event.addListener($scope.marker, 'dragend', function(event) {
				$scope.stopPoint.longitude = Number((event.latLng.lng()).toFixed(6));
				$scope.stopPoint.latitude = Number((event.latLng.lat()).toFixed(6));
				$scope.findLocation(event.latLng, $scope.stopPoint.description, $scope.stopPoint.locality, $scope.stopPoint.nation);
				$scope.$apply();
			});
		} else {
			var zoom = 4;
			if ($window.innerWidth <= 768) zoom = 2;
			if ($window.innerWidth <= 992) zoom = 3;
			mapOptions = {
				zoom: zoom,
				minZoom: zoom,
				center: new google.maps.LatLng(54.525961, 15.255119), // Europa
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				streetViewControl: true
			};
			map = new google.maps.Map(document.getElementById('map'), mapOptions);
		}

		google.maps.event.addListener(map, 'idle', function() {
			$scope.refreshMapHome();
		});

		google.maps.event.addListener(map, 'click', function(event) {
			if ($scope.marker != null) $scope.marker.setMap(null);
			$scope.marker = new google.maps.Marker({
				position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
				icon: 'img/markers/marker-icon.png',
				draggable: true,
				map: map
			});
			$scope.stopPoint.longitude = Number((event.latLng.lng()).toFixed(6));
			$scope.stopPoint.latitude = Number((event.latLng.lat()).toFixed(6));
			$scope.findLocation(event.latLng, $scope.stopPoint.description, $scope.stopPoint.locality, $scope.stopPoint.nation);
			$scope.$apply();
			google.maps.event.addListener($scope.marker, 'dragend', function(event) {
				$scope.stopPoint.longitude = Number((event.latLng.lng()).toFixed(6));
				$scope.stopPoint.latitude = Number((event.latLng.lat()).toFixed(6));
				$scope.findLocation(event.latLng, $scope.stopPoint.description, $scope.stopPoint.locality, $scope.stopPoint.nation);
				$scope.$apply();
			});
		});

		$timeout(function() {
			zoom = map.getZoom();
			center = map.getCenter();
			google.maps.event.trigger(map, 'resize');
			map.setZoom(zoom);
			map.setCenter(center);
			infoWindow = new google.maps.InfoWindow({maxWidth: 450});
		});
	}

	if ($stateParams.stopId) {
		$scope.stopPoint.stopId = $stateParams.stopId;
		$http({
			method: 'GET',
	    	url: 'http://www.campersites.info:8082/stoppoints/' + $scope.stopPoint.stopId,
		    headers: {'X-User': $scope.user.userId}
	    }).
	    then(function(response) {
			$scope.stopPoint = response.data;
		    LoadGoogleMapAPI.then(function () {
				$scope.initMap();
		    });
	    }, function(response) {
			$scope.errore = true;
			$modal.open({
				animation: true,
				templateUrl: 'templates/errore.html',
				controller: 'erroreController',
				size: 'sm',
				resolve: {
					response: function () {
		       			return null;
	        		}
				}
			});
		});
	} else {
	    LoadGoogleMapAPI.then(function () {
			$scope.initMap();
	    });
	}

});

angular.module('campersites').controller('uploadPhotoController', function($scope, $modalInstance, $timeout, stopId, Upload, blockUI) {
	$scope.user = null;
	if (localStorage.user) {
		$scope.user = JSON.parse(localStorage.user);
	}
	$scope.system = false;
	$scope.stopId = stopId;

    $scope.uploadFile = function(file) {
	    file.upload = Upload.upload({
	    	url: 'http://www.campersites.info:8082/images/upload/' + $scope.stopId,
	    	method: 'POST',
	    	data: {file: file},
	    	headers: {'X-User': $scope.user.userId}
	    });

	    file.upload.then(function (response) {
	    	$timeout(function () {
	    		blockUI.reset();
	        	file.result = response.data;
	    	});
	    }, function (response) {
    		blockUI.reset();
	    	if (response.status > 0)
	        	$scope.system = true;
	    }, function (evt) {
    		blockUI.reset();
	    	// Math.min is to fix IE which reports 200% sometimes
	    	file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
	    });
    }

    $scope.removeFile = function(files, index) {
    	files.splice(index, 1);
    }

});

angular.module('campersites').controller('preferitiController', function($scope, $http, $stateParams, $modal, $translate, $state, ngMeta) {
	$translate(['label.si', 'label.no', 'label.gratuito']).then(function (translations) {
		$scope.label_si = translations['label.si'];
		$scope.label_no = translations['label.no'];
		$scope.label_gratuito = translations['label.gratuito'];
	});

	$scope.user = null;
	if (localStorage.user) {
		$scope.user = JSON.parse(localStorage.user);
	}
	if (!$scope.user) {
		document.location.href = "/";
	}
	$scope.stopPoints = [];
	
   	ngMeta.setTitle($translate.instant('label.preferiti'));
	ngMeta.setDescription($translate.instant('desc.description'));

	$scope.getNotte = function(stopPoint){
		if (stopPoint.notte == 0) return $scope.label_no;
		if (stopPoint.notte == 1) return $scope.label_si;
		return '-';
	};
	$scope.getNotteClass = function(stopPoint){
		if (stopPoint.notte == 0) return 'text-danger';
		if (stopPoint.notte == 1) return 'text-success';
		return '';
	};
	$scope.getPrezzo = function(prezzo){
		if (prezzo === "0") return $scope.label_gratuito;
		if (prezzo != '') return '€ '+prezzo;
		return '-';
	};
	$scope.getPrezzoClass = function(prezzo){
		if (prezzo === "0") return 'text-success';
		if (prezzo != '') return 'text-danger';
		return '';
	};
	$scope.getChiusura = function(stopPoint){
		if (stopPoint.chiusura != null && stopPoint.chiusura != '') return stopPoint.chiusura;
		return '-';
	};

	$http({
		method: 'GET',
		url: 'http://www.campersites.info:8082/stoppoints/preferiti',
		headers: {'X-User': $scope.user.userId}
	}).
	then(function(response) {
		$scope.stopPoints = response.data;
	}, function(response) {
		$modal.open({
			animation: true,
			templateUrl: 'templates/errore.html',
			controller: 'erroreController',
			size: 'sm',
			resolve: {
				response: function () {
	       			return null;
        		}
			}
		});
	});
	
});

angular.module('campersites').controller('poipersonaliController', function($scope, $http, $modal, $timeout, $translate, LoadGoogleMapAPI, ngMeta, $window) {
	$translate(['error.modificako']).then(function (translations) {
		$scope.error_modificako = translations['error.modificako'];
	});
	$scope.user = null;
	if (localStorage.user) {
		$scope.user = JSON.parse(localStorage.user);
	}
	if (!$scope.user) {
		document.location.href = "/";
	}

	$scope.stopPoint = {
		name: '',
		description: ''
	};

	$scope.cercaLuogo = "";
	$scope.mapHeight = window.innerHeight-212; // Tolgo altezza top
	$scope.marker = null;
	$scope.markers = new Map();

   	ngMeta.setTitle($translate.instant('label.poipersonali'));
	ngMeta.setDescription($translate.instant('desc.description'));

	$scope.cercaVicino = function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				map.setZoom(14);
				map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
			}, function (response) {
				$modal.open({
					animation: true,
					templateUrl: 'templates/errore.html',
					controller: 'erroreController',
					size: 'sm',
					resolve: {
						response: function () {
	       					return $scope.error_gps;
        				}
					}
				});
			}, {maximumAge: 180000, timeout: 15000, enableHighAccuracy: false});
		} else {
			$modal.open({
				animation: true,
				templateUrl: 'templates/errore.html',
				controller: 'erroreController',
				size: 'sm',
				resolve: {
					response: function () {
       					return $scope.error_gps;
       				}
				}
			});
		}
	};

	$scope.geocodeAddress = function(address) {
		geocoder.geocode({'address': address}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0].geometry.viewport) {
			    	map.fitBounds(results[0].geometry.viewport);
			    } else {
			    	map.setCenter(results[0].geometry.location);
			    	map.setZoom(14);
			    }
			}
		});
	};

	$scope.cercaLuogoKeypress = function(event) {
		if (event.which === 13) {
			$scope.cercaLuogo = document.getElementById("cercaLuogo").value;
			$scope.geocodeAddress($scope.cercaLuogo);
		}
	};

	$scope.cercaLuogoClick = function() {
		$scope.geocodeAddress($scope.cercaLuogo);
	};

	$scope.findLocation = function(location) {
		geocoder = new google.maps.Geocoder();
		geocoder.geocode ( {'location': location}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				$scope.stopPoint.name = '';
				if (results[0].formatted_address != undefined) {
					$scope.stopPoint.description = results[0].formatted_address;
					if ($scope.marker) $scope.marker.setTitle(results[0].formatted_address);
				}
				$scope.$apply();
			}
		});
	};

	$scope.savePoi = function(form) {
		$scope.stopPoint.userId = $scope.user.userId;
		$http({
		    method: 'POST',
		    url: 'http://www.campersites.info:8082/userpois/',
		    data: $scope.stopPoint,
    		headers: {'X-User': $scope.user.userId}
		}).
		then(function(response) {
			$scope.stopPoint = response.data;
		}, function(response) {
			if (response.status === 400) {
				$modal.open({
					animation: true,
					templateUrl: 'templates/errore.html',
					controller: 'erroreController',
					size: 'sm',
					resolve: {
						response: function () {
	       					return $scope.error_modificako;
	       				}
					}
				});
			} else {
				$modal.open({
					animation: true,
					templateUrl: 'templates/errore.html',
					controller: 'erroreController',
					size: 'sm',
					resolve: {
						response: function () {
	       					return null;
	       				}
					}
				});
			}
		});
	};

	$scope.deletePoi = function() {
		if ($scope.stopPoint.poiId) {
			$http({
			    method: 'POST',
			    url: 'http://www.campersites.info:8082/userpois/delete/' + $scope.stopPoint.poiId,
	    		headers: {'X-User': $scope.user.userId}
			}).
			then(function(response) {
				var marker = $scope.markers.get($scope.stopPoint.poiId);
				marker.setMap(null);
				$scope.markers.delete($scope.stopPoint.poiId);
				$scope.stopPoint = {
					name: '',
					description: ''
				};
			}, function(response) {
				$modal.open({
					animation: true,
					templateUrl: 'templates/errore.html',
					controller: 'erroreController',
					size: 'sm',
					resolve: {
						response: function () {
	       					return null;
	       				}
					}
				});
			});
		}
	};

	$scope.refreshMapHome = function() {
		$http({
			method: 'GET',
    		url: 'http://www.campersites.info:8082/userpois/bound/' + map.getBounds().toUrlValue(),
    		headers: {'X-User': $scope.user.userId}
    	}).
    	then(function(response) {
       		angular.forEach(response.data, function(userPoi, i) {
				if (!$scope.markers.has(userPoi.poiId)) {
					var iconUrl = 'img/markers/marker-icon.png';
					var icon = {
						url: iconUrl,
						size: new google.maps.Size(30, 41),
						anchor: new google.maps.Point(15, 40)
					};
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(userPoi.latitude, userPoi.longitude),
						icon: icon,
						id: userPoi.poiId,
						draggable: false,
						map: map
					});
					var contentString = '<div class="modal-body">'+
										'	<h4 class="text-uppercase text-nowrap" style="margin: 0 0 0px 0; overflow: hidden; text-overflow: ellipsis;">'+userPoi.name+'</h4>'+
										'	<p>'+userPoi.description+'</p>'+
										'</div>';
					marker.addListener('click', function() {
						$scope.stopPoint = userPoi;
						$scope.$apply();
						infoWindow.close();
						infoWindow.setContent(contentString);
						infoWindow.open(map, marker);
					});
					$scope.markers.set(userPoi.poiId, marker);
				}
           	});
    	}, function(response) {
    		$scope.viewPoiPersonali = false;
			$modal.open({
				animation: true,
				templateUrl: 'templates/errore.html',
				controller: 'erroreController',
				size: 'sm',
				resolve: {
					response: function () {
		       			return null;
	        		}
				}
			});
		});
	};

	var geocoder = null;
	var cercaLuogo = /** @type {HTMLInputElement} */(document.getElementById('cercaLuogo'));
	var autocomplete = null;
	
	var map = null;
	var infoWindow = null;
	$scope.initMap = function() {
		geocoder = new google.maps.Geocoder();
		autocomplete = new google.maps.places.Autocomplete(cercaLuogo);
		autocomplete.setTypes(['geocode']);
	    google.maps.event.addListener(autocomplete, 'place_changed', function() {
		   	var place = autocomplete.getPlace();
		   	if (place.formatted_address != undefined) {
				$scope.cercaLuogo = place.formatted_address;
				$scope.geocodeAddress($scope.cercaLuogo);
			}
	    });
		google.maps.visualRefresh = true;
		var mapOptions;
		var zoom = 3;
		if ($window.innerWidth <= 768) zoom = 2;
		mapOptions = {
			zoom: zoom,
			minZoom: zoom,
			center: new google.maps.LatLng(54.525961, 15.255119), // Europa
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			streetViewControl: true
		};
		map = new google.maps.Map(document.getElementById('map'), mapOptions);

		google.maps.event.addListener(map, 'idle', function() {
			$scope.refreshMapHome();
		});

		google.maps.event.addListener(map, 'click', function(event) {
			if ($scope.marker != null) $scope.marker.setMap(null);
			$scope.marker = new google.maps.Marker({
				position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
				icon: 'img/markers/marker-icon.png',
				draggable: true,
				map: map
			});
			$scope.stopPoint.longitude = Number((event.latLng.lng()).toFixed(6));
			$scope.stopPoint.latitude = Number((event.latLng.lat()).toFixed(6));
			$scope.findLocation(event.latLng);
			$scope.$apply();
			google.maps.event.addListener($scope.marker, 'dragend', function(event) {
				$scope.stopPoint.longitude = Number((event.latLng.lng()).toFixed(6));
				$scope.stopPoint.latitude = Number((event.latLng.lat()).toFixed(6));
				$scope.findLocation(event.latLng);
				$scope.$apply();
			});
		});

		$timeout(function() {
			zoom = map.getZoom();
			center = map.getCenter();
			google.maps.event.trigger(map, 'resize');
			map.setZoom(zoom);
			map.setCenter(center);
			infoWindow = new google.maps.InfoWindow({maxWidth: 450});
		});
	}

    LoadGoogleMapAPI.then(function () {
		$scope.initMap();
    });

});



// Directives
angular.module('campersites').directive('sameAs', function () {
	return {
		require: 'ngModel',
		link:
			function (scope, elem, attrs, ngModel) {
				ngModel.$parsers.unshift(validate);
				// Force-trigger the parsing pipeline.
				scope.$watch(attrs.sameAs, function () {
					ngModel.$setViewValue(ngModel.$viewValue);
				});
				function validate(value) {
					var isValid = scope.$eval(attrs.sameAs) == value;
					ngModel.$setValidity('same-as', isValid);
					return isValid ? value : undefined;
				}
			}
	};
});

angular.module('campersites').directive("autoComplete", function($compile, $timeout) {
    return {
      	replace: true,
      	scope: {
          tripIndex: '@'
        },
      	link: function(scope, elem, attr) {
        	var el = angular.element('<span/>');
        	var script = document.createElement('script');
        	script.text = 'var autocompleteTappa'+attr.tripIndex+' = new google.maps.places.Autocomplete(document.getElementById("'+attr.tripIndex+'"));autocompleteTappa'+attr.tripIndex+'.setTypes(["geocode"]);google.maps.event.addListener(autocompleteTappa'+attr.tripIndex+', "place_changed", function() {var place = autocompleteTappa'+attr.tripIndex+'.getPlace();if (place.formatted_address != undefined) document.getElementById("'+attr.tripIndex+'").value = place.formatted_address;});';
            el.append(script);
        	$compile(el)(scope);
        	$timeout(function(){
        		elem.append(el);
        	});
      	}
    }
});

angular.module('campersites').directive("autofill", function () {
    return {
        require: "ngModel",
        link: function (scope, element, attrs, ngModel) {
            scope.$on("autofill:update", function() {
                ngModel.$setViewValue(element.val());
            });
        }
    }
});

angular.module('campersites').directive('consent', function ($cookies, $translate, $window) {
	return {
    	scope: {},
    	template:
      		'<div ng-cloak style="position: relative; z-index: 9000;"">' +
      			'<div class="alert alert-info" role="alert" style="background-color: rgba(245, 245, 245, 0.6); position: fixed; bottom: 0; left: 0; right: 0; margin-bottom: 0" ng-hide="consent()">' +
                	'<span style="line-height: 34px;" translate>desc.cookiemessage</span><a class="alert-link" href="http://www.campersites.info/privacy" translate>desc.cookiemoreinfo</a>' +
      				'<a href="" class="btn btn-primary" style="float: right;" role="button" ng-click="consent(true)">OK</a>' +
      			'</div>' +
      		'</div>',
    	controller: function ($scope) {
      		var _consent = $cookies.get('consent');
      		$scope.consent = function (consent) {
        		if (consent === undefined) {
          			return _consent;
        		} else if (consent) {
        			var now = new $window.Date(),
    				exp = new $window.Date(now.getFullYear(), now.getMonth()+6, now.getDate());
          			$cookies.put('consent', true, {expires: exp});
          			_consent = true;        
        		}
      		};
    	}
  	};
});



// Services
angular.module('campersites').service('LocaleService', function ($translate, $rootScope, tmhDynamicLocale, $state, $timeout, ngMeta) {
    'use strict';

    // METHODS
    var setLocale = function (locale) {
    	// asking angular-translate to load and apply proper translations
    	$translate.use(locale);
    	$state.reload();
    };
    
    // EVENTS
    // on successful applying translations by angular-translate
    $rootScope.$on('$translateChangeSuccess', function (event, data) {
    	document.documentElement.setAttribute('lang', data.language);
   		tmhDynamicLocale.set(data.language);
		var currentLocale = data.language;
		if (currentLocale === 'en') {
			currentLocale = 'en_GB';
		} else {
			currentLocale = currentLocale + '_' + currentLocale.toUpperCase();
		}
		$timeout(function() {
			ngMeta.setOgLocale(currentLocale);
		});
    });
    
    return {
      	setLocale: function (locale) {
        	setLocale(locale);
      	}
    };
});

angular.module('campersites').service('LoadGoogleMapAPI', function ($window, $q, $translate) {
	var deferred = $q.defer();

	// Load Google map API script
	function loadScript() {
		var csScriptElement = document.getElementById('cs-script');
		var script = document.createElement('script');
		script.id = 'google-map';
		script.src = 'http://maps.googleapis.com/maps/api/js?key=AIzaSyAG4XtFABY3BR_-Mph6PVuqT6Re6KTUyMA&v=3.31&libraries=places&language='+$translate.use()+'&callback=initMap';
		csScriptElement.parentNode.insertBefore(script, csScriptElement.nextSibling);
		//document.body.appendChild(script);
	}

	// Script loaded callback, send resolve
	$window.initMap = function () {
		deferred.resolve();
	};

	loadScript();

	return deferred.promise;
});

angular.module('campersites').service('LoadRouteBoxer', function ($window, $q) {
	var deferred = $q.defer();

	// Load Google map API script
	function loadScript() {
		var googleScriptElement = document.getElementById('google-map');
		var script = document.createElement('script');
		script.id = 'route-boxer';
		script.src = 'js/RouteBoxer.js';
		googleScriptElement.parentNode.insertBefore(script, googleScriptElement.nextSibling);
		//document.body.appendChild(script);
		deferred.resolve();
	}

	loadScript();

	return deferred.promise;
});



//Filters
angular.module('campersites').filter('trustUrl', function ($sce) {
    return function(url) {
    	return $sce.trustAsResourceUrl(url);
    };
});



//Modules
angular.module('ngMeta', []).provider('ngMeta', function () {

    'use strict';

    var defaults = {
        title: '',
        titleSuffix: '',
        description: '',
        ogImgUrl: '',
        ogTitle: ''
    };

    var config = {
        name: 'ngMeta',
        useTitleSuffix: false,
        ogType: 'website',
        ogSiteName: '',
        ogLocale: 'en_GB',
    };

    //Constructor
    function Meta($rootScope) {

        var setTitle = function (title, titleSuffix) {
            $rootScope[config.name].title = title || defaults.title;
            if (config.useTitleSuffix) {
                $rootScope[config.name].title += titleSuffix || defaults.titleSuffix;
            }
        };

        var setDescription = function (description) {
            $rootScope[config.name].description = description || defaults.description;
        };

        var setOgImgUrl = function (ogImgUrl) {
            $rootScope[config.name].ogImgUrl = ogImgUrl || defaults.ogImgUrl;
        };

        var setOgLocale = function (ogLocale) {
            $rootScope[config.name].ogLocale = ogLocale || defaults.ogLocale;
        };

        var readRouteMeta = function (meta) {
            meta = meta || {};
            setTitle(meta.title, meta.titleSuffix);
            setDescription(meta.description);
            setOgImgUrl(meta.ogImgUrl);
            setOgLocale(meta.ogLocale);
        };

        var update = function (event, current) {
            readRouteMeta(current.meta);
        };

        $rootScope[config.name] = {};
        $rootScope[config.name].ogType = config.ogType;
        $rootScope[config.name].ogSiteName = config.ogSiteName;
        $rootScope[config.name].ogLocale = config.ogLocale;
        $rootScope.$on('$routeChangeSuccess', update);
        $rootScope.$on('$stateChangeSuccess', update);

        return {
            'setTitle': setTitle,
            'setDescription': setDescription,
            'setOgImgUrl': setOgImgUrl,
            'setOgLocale': setOgLocale
        };
    }

    /* Set defaults */
    this.setDefaultTitle = function (titleStr) {
        defaults.title = titleStr;
    };

    this.setDefaultTitleSuffix = function (titleSuffix) {
        defaults.titleSuffix = titleSuffix;
    };

    this.setDefaultDescription = function (desc) {
        defaults.description = desc;
    };

    this.setDefaultOgImgUrl = function (imgUrl) {
        defaults.ogImgUrl = imgUrl;
    };

    /* One-time config */

    this.setName = function (varName) {
        config.name = varName;
    };

    this.useTitleSuffix = function (bool) {
        config.useTitleSuffix = !!bool;
    };

    this.setOgType = function (type) {
        config.ogType = type;
    };

    this.setOgSiteName = function (siteName) {
        config.ogSiteName = siteName;
    };

    this.setOgLocale = function (locale) {
        config.ogLocale = locale;
    };

    // Method for instantiating
    this.$get = function ($rootScope) {
        return new Meta($rootScope);
    };
});



/*!
 * IE10 viewport hack for Surface/desktop Windows 8 bug
 * Copyright 2014-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

// See the Getting Started docs for more information:
// http://getbootstrap.com/getting-started/#support-ie10-width

(function () {
  'use strict';

  if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
    var msViewportStyle = document.createElement('style')
    msViewportStyle.appendChild(
      document.createTextNode(
        '@-ms-viewport{width:auto!important}'
      )
    )
    document.querySelector('head').appendChild(msViewportStyle)
  }

})();

