'use strict';

angular.module('cacApp', ['ngRoute', 'ngAnimate'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: './home.html'
            })
            .when('/countries', {
                templateUrl: './countries.html',
                controller: 'countriesCtrl'
            })
            .when('/countries/:country', {
                templateUrl: './country.html',
                controller: 'countryCtrl'
            })
            .when('/error', {
                templateUrl: './error.html'
            })
            .otherwise('/error', {
                templateUrl: './error.html'
            })
        ;
    }])

    .run(function ($rootScope, $location, $timeout) {
        $rootScope.$on('$routeChangeError', function () {
            $location.path("/error");
        });
        $rootScope.$on('$routeChangeStart', function () {
            $rootScope.isLoading = true;
        });
        $rootScope.$on('$routeChangeSuccess', function () {
            $timeout(function () {
                $rootScope.isLoading = false;
            }, 1000);
        });
    })

    // use these more
    .constant('API_PREFIX', 'http://api.geonames.org')

    .constant('LIST_COUNTRIES', '/countryInfoJSON?')
    .constant('NEIGHBOURS', '/neighboursJSON?')
    .constant('SEARCH', '/searchJSON?')

    .constant('USER_NAME', 'username=vinod_lala')
    .constant('COUNTRY', 'country=')

    .factory('countryInfo', ['$location', '$http', 'API_PREFIX', 'LIST_COUNTRIES', 'USER_NAME',
        function ($location, $http, API_PREFIX, LIST_COUNTRIES, USER_NAME) {
            var countries = [];
            var countryResult = {};
            var path = API_PREFIX + LIST_COUNTRIES + USER_NAME;
            var i;
            $http.get(path, {cache: true})
                .success(function (data) {
                    for (i = 0; i < data.geonames.length; i++) {
                        countries[i] = data.geonames[i];
                    }
                })
                .error(function (data, status) {
                    console.log('Error status: ' + status);
                    $location.path('/error');
                });

            function getCountries() {
                return countries;
            }

            function getCountry(countryName) {
                // has to be a better way to search through array
                for (i = 0; i < countries.length; i++) {
                    if (countries[i].countryName === countryName) {
                        countryResult = countries[i];
                        break;
                    }
                }
                return countryResult;
            }

            return {
                getCountries: getCountries,
                getCountry: getCountry
            };
        }])

    .factory('capitalPopulation', ['countryInfo', 'countryNeighbors', '$http', '$location', function (countryInfo, countryNeighbors, $http, $location) {
        var getCapitalPopulation = function (countryCode, capital) {
            //debugger;
            var capitalPopulation = 0;
            var path = 'http://api.geonames.org/searchJSON?';
            var request = {
                q: capital,
                country: countryCode, // two-character country code
                //featurecode: 'pplc', //capital of a political entity
                fcode: 'pplc', //capital of a political entity
                username: 'vinod_lala'
            };
            $http({
                method: 'GET',
                url: path,
                cache: true,
                params: request
            })
                .success(function (data) {
                    //debugger;
                    if (capital) {
                        //debugger;
                        capitalPopulation = data.geonames[0].population;
                        //debugger;
                    } else {
                        //debugger;
                        capitalPopulation = 0;
                        //debugger;
                    }
                })
                .error(function () {
                    console.log('Error status: ' + status);
                    $location.path('/error');
                });
            //debugger;
            return capitalPopulation;
            //debugger;
        };
        return {
            getCapitalPopulation: getCapitalPopulation
        };
    }])

    .factory('countryNeighbors', ['$http', 'countryInfo', '$location', function ($http, countryInfo, $location) {
        var i;
        //debugger;
        var getNeighbors = function (countryName) {
            //debugger;
            var neighbors = [];
            // do I really need geonameId?
            var geoId = countryInfo.getCountry(countryName).geonameId;
            //debugger;
            var path = 'http://api.geonames.org/neighboursJSON?';
            var request = {
                geonameId: geoId,
                country: countryName,
                username: 'vinod_lala'
            };
            if (countryName == 'Antarctica') {
                neighbors = [];
            } else {
                $http({
                    method: 'GET',
                    url: path,
                    cache: true,
                    params: request
                })
                    .success(function (data) {
                        //debugger;
                        if (data.geonames.length === 0) {
                            neighbors = [];
                        } else {
                            for (i = 0; i < data.geonames.length; i++) {
                                //debugger;
                                neighbors[i] = data.geonames[i].countryName;
                            }
                        }

                    })
                    .error(function (data, status) {
                        console.log('Error status: ' + status);
                        $location.path('/error');
                    });
            }
            //debugger;
            return neighbors;
            //debugger;
        };
        return {
            getNeighbors: getNeighbors
        };
    }])

    .controller('countriesCtrl', ['countryInfo', '$scope', '$location', '$rootScope', '$timeout',
        function (countryInfo, $scope, $location, $rootScope, $timeout) {
            $scope.countries = countryInfo.getCountries();
            $scope.goToCountry = function (countryName) {
                $location.path('/countries/' + countryName);
            }
        }])

    .controller('countryCtrl', ['$scope', 'countryInfo', 'countryNeighbors', 'capitalPopulation', '$routeParams',
        function ($scope, countryInfo, countryNeighbors, capitalPopulation, $routeParams) {

            //debugger;
            var country = countryInfo.getCountry($routeParams.country);
            $scope.country = country;
            //debugger;
            $scope.country.neighbors = countryNeighbors.getNeighbors(country.countryName);
            //debugger;
            $scope.country.capitalPopulation = capitalPopulation.getCapitalPopulation(country.countryCode, country.capital);
            //debugger;
        }])
;